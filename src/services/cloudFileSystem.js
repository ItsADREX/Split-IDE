import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class CloudFileSystem {
    constructor(userId) {
        this.userId = userId;
        this.isConfigured = isSupabaseConfigured;
    }

    // Project Management
    async getProjects() {
        if (!this.isConfigured || !this.userId) {
            return { data: [], error: null };
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            return { data: data || [], error };
        } catch (error) {
            console.warn('Failed to fetch projects:', error);
            return { data: [], error };
        }
    }

    async createProject(name, description = '') {
        if (!this.isConfigured || !this.userId) {
            return { data: null, error: { message: 'Not authenticated' } };
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    user_id: this.userId,
                    name,
                    description
                }])
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.warn('Failed to create project:', error);
            return { data: null, error };
        }
    }

    async getDefaultProject() {
        if (!this.isConfigured || !this.userId) {
            return { data: null, error: null };
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', this.userId)
                .eq('is_default', true)
                .single();

            return { data, error };
        } catch (error) {
            console.warn('Failed to fetch default project:', error);
            return { data: null, error };
        }
    }

    // File Management
    async getFiles(projectId) {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { data: [], error: null };
        }

        try {
            const { data, error } = await supabase
                .from('files')
                .select('*')
                .eq('project_id', projectId)
                .order('filename', { ascending: true });

            return { data: data || [], error };
        } catch (error) {
            console.warn('Failed to fetch files:', error);
            return { data: [], error };
        }
    }

    async saveFile(projectId, filename, content, fileType = null, filePath = '') {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { data: null, error: { message: 'Not authenticated' } };
        }

        try {
            // Try to update existing file first
            const { data: existingFile } = await supabase
                .from('files')
                .select('id')
                .eq('project_id', projectId)
                .eq('filename', filename)
                .eq('file_path', filePath)
                .single();

            let result;
            if (existingFile) {
                // Update existing file
                result = await supabase
                    .from('files')
                    .update({
                        content,
                        file_type: fileType,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingFile.id)
                    .select()
                    .single();
            } else {
                // Create new file
                result = await supabase
                    .from('files')
                    .insert([{
                        project_id: projectId,
                        filename,
                        content,
                        file_type: fileType,
                        file_path: filePath
                    }])
                    .select()
                    .single();
            }

            return result;
        } catch (error) {
            console.warn('Failed to save file:', error);
            return { data: null, error };
        }
    }

    async deleteFile(projectId, filename, filePath = '') {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { error: { message: 'Not authenticated' } };
        }

        try {
            const { error } = await supabase
                .from('files')
                .delete()
                .eq('project_id', projectId)
                .eq('filename', filename)
                .eq('file_path', filePath);

            return { error };
        } catch (error) {
            console.warn('Failed to delete file:', error);
            return { error };
        }
    }

    async renameFile(projectId, oldFilename, newFilename, filePath = '') {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { error: { message: 'Not authenticated' } };
        }

        try {
            const { data, error } = await supabase
                .from('files')
                .update({ filename: newFilename })
                .eq('project_id', projectId)
                .eq('filename', oldFilename)
                .eq('file_path', filePath)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.warn('Failed to rename file:', error);
            return { data: null, error };
        }
    }

    // Batch operations for sync
    async syncFiles(projectId, localFiles) {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Get current cloud files
            const { data: cloudFiles, error: fetchError } = await this.getFiles(projectId);
            if (fetchError) throw fetchError;

            const operations = [];
            const cloudFileMap = new Map(cloudFiles.map(f => [`${f.file_path}/${f.filename}`, f]));

            // Process local files
            for (const [filePath, content] of Object.entries(localFiles)) {
                const filename = filePath.split('/').pop();
                const path = filePath.substring(0, filePath.lastIndexOf('/')) || '';
                
                const cloudFile = cloudFileMap.get(filePath);
                
                if (!cloudFile || cloudFile.content !== content) {
                    // File needs to be created or updated
                    operations.push(
                        this.saveFile(projectId, filename, content, this.getFileType(filename), path)
                    );
                }
            }

            // Execute all operations
            await Promise.all(operations);
            
            return { success: true, error: null };
        } catch (error) {
            console.warn('Failed to sync files:', error);
            return { success: false, error: error.message };
        }
    }

    // User Preferences
    async getUserPreferences() {
        if (!this.isConfigured || !this.userId) {
            return { data: null, error: null };
        }

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', this.userId)
                .single();

            return { data, error };
        } catch (error) {
            console.warn('Failed to fetch user preferences:', error);
            return { data: null, error };
        }
    }

    async saveUserPreferences(preferences) {
        if (!this.isConfigured || !this.userId) {
            return { error: { message: 'Not authenticated' } };
        }

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: this.userId,
                    ...preferences
                })
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
            return { data: null, error };
        }
    }

    // Utility methods
    getFileType(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const typeMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'txt': 'text'
        };
        return typeMap[ext] || 'text';
    }

    // Real-time subscriptions
    subscribeToProjectFiles(projectId, callback) {
        if (!this.isConfigured || !this.userId || !projectId) {
            return { unsubscribe: () => {} };
        }

        const subscription = supabase
            .channel(`project-files-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'files',
                    filter: `project_id=eq.${projectId}`
                },
                callback
            )
            .subscribe();

        return {
            unsubscribe: () => {
                supabase.removeChannel(subscription);
            }
        };
    }
}

// Factory function to create cloud file system instance
export const createCloudFileSystem = (userId) => {
    return new CloudFileSystem(userId);
};
