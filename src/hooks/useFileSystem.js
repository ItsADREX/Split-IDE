import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createCloudFileSystem } from '../services/cloudFileSystem';
import { useAuth } from '../contexts/AuthContext';

const DEBOUNCE_SAVE_MS = 1500;
const DEBOUNCE_LS_MS = 1500;

export function useFileSystem(logTerm) {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState('// React Code Editor Loaded\n');
    const [fileCache, setFileCache] = useState({});
    const [openFolders, setOpenFolders] = useState({});
    const [openTabs, setOpenTabs] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [cloudFS, setCloudFS] = useState(null);
    const [syncStatus, setSyncStatus] = useState('offline'); // offline, syncing, synced, error

    const debounceRef = useRef(null);
    const lsDebounceRef = useRef(null);
    const cloudSyncRef = useRef(null);
    const stateRef = useRef({ activeFile: null, content: '' });
    const subscriptionRef = useRef(null);

    useEffect(() => {
        stateRef.current = { activeFile, content };
    }, [activeFile, content]);

    // Initialize cloud file system when user changes
    useEffect(() => {
        if (user?.id) {
            const newCloudFS = createCloudFileSystem(user.id);
            setCloudFS(newCloudFS);
            setSyncStatus('syncing');
            initializeUserProject(newCloudFS);
        } else {
            setCloudFS(null);
            setCurrentProject(null);
            setSyncStatus('offline');
            // Clean up subscription
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        }
    }, [user]);

    const syncToLocalStorage = useCallback((cacheMap) => {
        clearTimeout(lsDebounceRef.current);
        lsDebounceRef.current = setTimeout(() => {
            try {
                const lsData = Object.keys(cacheMap).map(k => ({ filename: k, content: cacheMap[k] }));
                localStorage.setItem('split_ide_files', JSON.stringify(lsData));
            } catch (e) { }
        }, DEBOUNCE_LS_MS);
    }, []);

    const syncToCloud = useCallback((cacheMap) => {
        if (!cloudFS || !currentProject?.id) return;
        
        clearTimeout(cloudSyncRef.current);
        cloudSyncRef.current = setTimeout(async () => {
            try {
                setSyncStatus('syncing');
                const result = await cloudFS.syncFiles(currentProject.id, cacheMap);
                setSyncStatus(result.success ? 'synced' : 'error');
                if (!result.success) {
                    logTerm(`Sync failed: ${result.error}`, 'error');
                }
            } catch (error) {
                setSyncStatus('error');
                logTerm(`Sync error: ${error.message}`, 'error');
            }
        }, DEBOUNCE_SAVE_MS);
    }, [cloudFS, currentProject, logTerm]);

    const initializeUserProject = useCallback(async (cloudFileSystem) => {
        try {
            // Get or create default project
            let { data: project, error } = await cloudFileSystem.getDefaultProject();
            
            if (error || !project) {
                // Create default project if it doesn't exist
                const createResult = await cloudFileSystem.createProject(
                    'My First Project', 
                    'Welcome to Split-IDE! Start coding here.'
                );
                project = createResult.data;
            }

            if (project) {
                setCurrentProject(project);
                await loadProjectFiles(cloudFileSystem, project.id);
                
                // Set up real-time subscription
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                }
                subscriptionRef.current = cloudFileSystem.subscribeToProjectFiles(
                    project.id,
                    handleRealtimeUpdate
                );
            }
        } catch (error) {
            console.warn('Failed to initialize user project:', error);
            setSyncStatus('error');
        }
    }, []);

    const loadProjectFiles = useCallback(async (cloudFileSystem, projectId) => {
        try {
            const { data: cloudFiles, error } = await cloudFileSystem.getFiles(projectId);
            if (error) throw error;

            if (cloudFiles && cloudFiles.length > 0) {
                // Convert cloud files to local format
                const fileList = cloudFiles.map(f => {
                    const fullPath = f.file_path ? `${f.file_path}/${f.filename}` : f.filename;
                    return fullPath;
                });
                
                const cache = {};
                cloudFiles.forEach(f => {
                    const fullPath = f.file_path ? `${f.file_path}/${f.filename}` : f.filename;
                    cache[fullPath] = f.content || '';
                });

                setFiles(fileList);
                setFileCache(cache);
                
                // Select first file if none selected
                if (!activeFile && fileList.length > 0) {
                    selectFile(fileList[0]);
                }
                
                setSyncStatus('synced');
            } else {
                // No cloud files, load from localStorage as fallback
                await fetchFiles();
            }
        } catch (error) {
            console.warn('Failed to load project files:', error);
            setSyncStatus('error');
            // Fallback to localStorage
            await fetchFiles();
        }
    }, [activeFile]);

    const handleRealtimeUpdate = useCallback((payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
            case 'UPDATE':
                if (newRecord) {
                    const fullPath = newRecord.file_path ? 
                        `${newRecord.file_path}/${newRecord.filename}` : 
                        newRecord.filename;
                    
                    setFiles(prev => {
                        if (!prev.includes(fullPath)) {
                            return [...prev, fullPath].sort();
                        }
                        return prev;
                    });
                    
                    setFileCache(prev => ({
                        ...prev,
                        [fullPath]: newRecord.content || ''
                    }));
                }
                break;
            case 'DELETE':
                if (oldRecord) {
                    const fullPath = oldRecord.file_path ? 
                        `${oldRecord.file_path}/${oldRecord.filename}` : 
                        oldRecord.filename;
                    
                    setFiles(prev => prev.filter(f => f !== fullPath));
                    setFileCache(prev => {
                        const newCache = { ...prev };
                        delete newCache[fullPath];
                        return newCache;
                    });
                }
                break;
        }
    }, []);

    const selectFile = useCallback((filename, predefinedContent = null) => {
        const curRef = stateRef.current;

        if (curRef.activeFile) {
            setFileCache(prev => {
                const nc = { ...prev, [curRef.activeFile]: curRef.content };
                syncToLocalStorage(nc);
                syncToCloud(nc);
                return nc;
            });
        }

        setActiveFile(filename);

        // Add to open tabs if not already there
        setOpenTabs(prev => prev.includes(filename) ? prev : [...prev, filename]);

        if (predefinedContent !== null) {
            setContent(predefinedContent);
        } else {
            setFileCache(prev => {
                if (prev[filename] !== undefined) {
                    setContent(prev[filename]);
                } else {
                    setContent('// Data Missing from Store. Reload tree.\n');
                }
                return prev;
            });
        }
    }, [syncToLocalStorage, syncToCloud]);

    const fetchFiles = useCallback(async () => {
        let preloadedData = [];
        
        // Only attempt Supabase connection if properly configured
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('files').select('*');
                if (error) throw error;
                preloadedData = data || [];
            } catch (err) {
                // Only log error if we actually tried to connect
                console.warn('Supabase connection failed, using offline storage');
                const local = localStorage.getItem('split_ide_files');
                if (local) preloadedData = JSON.parse(local);
            }
        } else {
            // Silently use offline storage when Supabase isn't configured
            const local = localStorage.getItem('split_ide_files');
            if (local) preloadedData = JSON.parse(local);
        }

        if (preloadedData && preloadedData.length > 0) {
            localStorage.setItem('split_ide_files', JSON.stringify(preloadedData));
            const cache = {};
            const names = [];

            preloadedData.forEach(d => {
                cache[d.filename] = d.content || "";
                names.push(d.filename);
            });

            setFileCache(cache);
            setFiles(names);

            const baseDirs = {};
            names.forEach(f => {
                const parts = f.split('/');
                parts.forEach((_, i) => {
                    if (i < parts.length - 1) baseDirs[parts.slice(0, i + 1).join('/')] = true;
                });
            });
            setOpenFolders(baseDirs);

            selectFile(names[0], cache[names[0]]);
        } else {
            setFiles(['app.js']);
            selectFile('app.js', '// Offline Local Workspace Loaded\n');
        }
    }, [logTerm, selectFile]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleEditorChange = useCallback((newContent) => {
        setContent(newContent);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const curRef = stateRef.current;
            if (curRef.activeFile) {
                setFileCache(prev => {
                    const nc = { ...prev, [curRef.activeFile]: newContent };
                    syncToLocalStorage(nc);
                    syncToCloud(nc);
                    return nc;
                });
            }
        }, DEBOUNCE_SAVE_MS);
    }, [syncToLocalStorage, syncToCloud]);

    const uploadFile = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (re) => {
                    const name = file.name;
                    const fileData = re.target.result || "";

                    setFiles(prev => prev.includes(name) ? prev : [...prev, name]);
                    setFileCache(prev => {
                        const nc = { ...prev, [name]: fileData };
                        syncToLocalStorage(nc);
                        syncToCloud(nc);
                        return nc;
                    });
                    selectFile(name, fileData);
                    logTerm(`Imported ${name}`, "success");

                    try {
                        await supabase.from('files').upsert({ filename: name, content: fileData }, { onConflict: 'filename' });
                    } catch (err) { }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, [logTerm, selectFile, syncToLocalStorage, syncToCloud]);

    const newFile = useCallback((filename) => {
        const name = typeof filename === 'string' ? filename : prompt('File name (e.g. index.html):');
        if (!name || !name.trim()) return;
        const trimmed = name.trim();
        if (files.includes(trimmed)) {
            logTerm(`File ${trimmed} already exists`, "error");
            return;
        }
        setFiles(prev => [...prev, trimmed].sort());
        setFileCache(prev => {
            const nc = { ...prev, [trimmed]: '' };
            syncToLocalStorage(nc);
            syncToCloud(nc);
            return nc;
        });
        selectFile(trimmed, '');
        logTerm(`Created ${trimmed}`, "success");
    }, [files, selectFile, syncToLocalStorage, syncToCloud, logTerm]);

    const newFolder = useCallback(() => {
        const f = prompt("Folder name:");
        if (f) {
            const name = `${f}/.keep`;
            setFiles(prev => prev.includes(name) ? prev : [...prev, name]);
            setOpenFolders(prev => ({ ...prev, [f]: true }));
            try {
                supabase.from('files').upsert({ filename: name, content: "// folder hook" }, { onConflict: 'filename' });
            } catch (err) { }
        }
    }, []);

    const toggleFolder = useCallback((path) => {
        setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
    }, []);

    const handleDragStart = useCallback((e, path, type) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ path, type }));
    }, []);

    const closeTab = useCallback((filename) => {
        setOpenTabs(prev => {
            const newTabs = prev.filter(f => f !== filename);
            
            // If closing the active file, switch to another tab or clear
            if (filename === stateRef.current.activeFile) {
                if (newTabs.length > 0) {
                    const nextFile = newTabs[newTabs.length - 1];
                    setActiveFile(nextFile);
                    setContent(fileCache[nextFile] || '// File content not found');
                } else {
                    setActiveFile(null);
                    setContent('// No files open');
                }
            }
            
            return newTabs;
        });
    }, [fileCache]);

    const deleteFile = useCallback(async (filename) => {
        if (confirm(`Are you sure you want to delete "${filename}"?`)) {
            // Remove from files list
            setFiles(prev => prev.filter(f => f !== filename));
            
            // Remove from cache
            setFileCache(prev => {
                const newCache = { ...prev };
                delete newCache[filename];
                syncToLocalStorage(newCache);
                return newCache;
            });
            
            // Close tab if open
            setOpenTabs(prev => {
                const newTabs = prev.filter(f => f !== filename);
                if (filename === stateRef.current.activeFile) {
                    if (newTabs.length > 0) {
                        const nextFile = newTabs[newTabs.length - 1];
                        setActiveFile(nextFile);
                        setContent(fileCache[nextFile] || '// File content not found');
                    } else {
                        setActiveFile(null);
                        setContent('// No files open');
                    }
                }
                return newTabs;
            });

            // Delete from Supabase
            try {
                await supabase.from('files').delete().eq('filename', filename);
                logTerm(`Deleted ${filename}`, "success");
            } catch (err) {
                logTerm(`Failed to delete ${filename} from cloud`, "error");
            }
        }
    }, [fileCache, logTerm, syncToLocalStorage]);

    const renameFile = useCallback(async (oldName, newName) => {
        if (!newName || newName === oldName || files.includes(newName)) {
            logTerm("Invalid file name or file already exists", "error");
            return;
        }

        // Update files list
        setFiles(prev => prev.map(f => f === oldName ? newName : f));
        
        // Update cache
        setFileCache(prev => {
            const newCache = { ...prev };
            newCache[newName] = newCache[oldName] || '';
            delete newCache[oldName];
            syncToLocalStorage(newCache);
            return newCache;
        });
        
        // Update tabs
        setOpenTabs(prev => prev.map(f => f === oldName ? newName : f));
        
        // Update active file if needed
        if (stateRef.current.activeFile === oldName) {
            setActiveFile(newName);
        }

        // Update in Supabase
        try {
            const { data } = await supabase.from('files').select('content').eq('filename', oldName).single();
            if (data) {
                await supabase.from('files').upsert({ filename: newName, content: data.content }, { onConflict: 'filename' });
                await supabase.from('files').delete().eq('filename', oldName);
            }
            logTerm(`Renamed ${oldName} to ${newName}`, "success");
        } catch (err) {
            logTerm(`Failed to rename ${oldName} in cloud`, "error");
        }
    }, [files, fileCache, logTerm, syncToLocalStorage]);

    const duplicateFile = useCallback(async (filename) => {
        const baseName = filename.split('.')[0];
        const extension = filename.includes('.') ? '.' + filename.split('.').pop() : '';
        let newName = `${baseName}_copy${extension}`;
        let counter = 1;
        
        while (files.includes(newName)) {
            newName = `${baseName}_copy${counter}${extension}`;
            counter++;
        }

        const content = fileCache[filename] || '';
        
        setFiles(prev => [...prev, newName]);
        setFileCache(prev => {
            const nc = { ...prev, [newName]: content };
            syncToLocalStorage(nc);
            syncToCloud(nc);
            return nc;
        });

        try {
            await supabase.from('files').upsert({ filename: newName, content }, { onConflict: 'filename' });
            logTerm(`Duplicated ${filename} as ${newName}`, "success");
        } catch (err) {
            logTerm(`Failed to save duplicate to cloud`, "error");
        }
    }, [files, fileCache, logTerm, syncToLocalStorage, syncToCloud]);

    const handleDrop = useCallback(async (e, targetFolder) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;
        const { path: sourcePath, type: isFolder } = JSON.parse(data);

        if (sourcePath === targetFolder || sourcePath.startsWith(targetFolder + '/')) return;

        const sourceName = sourcePath.split('/').pop();
        const newBasePath = targetFolder === '' ? sourceName : `${targetFolder}/${sourceName}`;

        let updatedFiles = [...files];
        const updates = [];

        if (isFolder === 'folder') {
            updatedFiles = updatedFiles.map(f => {
                if (f.startsWith(sourcePath + '/') || f === sourcePath) {
                    const relative = f.slice(sourcePath.length);
                    const newPath = newBasePath + relative;
                    updates.push({ old: f, new: newPath });
                    return newPath;
                }
                return f;
            });

            const af = stateRef.current.activeFile;
            if (updates.some(u => u.old === af)) {
                const newPath = updates.find(u => u.old === af).new;
                setActiveFile(newPath);
                setOpenTabs(prev => prev.map(t => t === af ? newPath : t));
            }
        } else {
            if (updatedFiles.includes(newBasePath)) {
                logTerm("File target clash.", "error");
                return;
            }
            updates.push({ old: sourcePath, new: newBasePath });
            updatedFiles = updatedFiles.map(f => f === sourcePath ? newBasePath : f);
            if (stateRef.current.activeFile === sourcePath) {
                setActiveFile(newBasePath);
                setOpenTabs(prev => prev.map(t => t === sourcePath ? newBasePath : t));
            }
        }

        setFiles(updatedFiles);

        setFileCache(prev => {
            const newCache = { ...prev };
            updates.forEach(u => {
                newCache[u.new] = newCache[u.old] || '';
                delete newCache[u.old];
            });
            syncToLocalStorage(newCache);
            syncToCloud(newCache);
            return newCache;
        });

        try {
            for (let u of updates) {
                const fileData = await supabase.from('files').select('content').eq('filename', u.old).single();
                if (fileData.data) {
                    await supabase.from('files').upsert({ filename: u.new, content: fileData.data.content }, { onConflict: 'filename' });
                    await supabase.from('files').delete().eq('filename', u.old);
                }
            }
        } catch (err) { }
    }, [files, logTerm, syncToLocalStorage, syncToCloud, fileCache]);

    return {
        files,
        activeFile,
        content,
        fileContents: fileCache,
        openFolders,
        openTabs,
        currentProject,
        syncStatus,
        selectFile,
        toggleFolder,
        handleEditorChange,
        handleDragStart,
        handleDrop,
        newFile,
        newFolder,
        uploadFile,
        closeTab,
        deleteFile,
        renameFile,
        duplicateFile
    };
}
