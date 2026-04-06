const SUPABASE_URL = 'https://pqlbcpsgqwqurrhuiadq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbGJjcHNncXdxdXJyaHVpYWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE0ODQsImV4cCI6MjA5MTA3NzQ4NH0.ClHQI4x7wHK43-4syv8C4yx08lx2SkZ3-4296Y-Axdo';

export class StorageService {
    constructor() {
        // Initialize from the globally injected window.supabase script
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async loadFile(filename) {
        if (!this.client) return "// DB Client Failed to initialize.";

        try {
            const { data, error } = await this.client
                .from('files')
                .select('content')
                .eq('filename', filename)
                .single();

            if (error && error.code === 'PGRST116') {
                // File does not exist in Cloud yet, start fresh
                return `// Split IDE - New Virtual File: ${filename}\n\n// Start typing...`;
            }
            if (error) throw error;

            return data.content || "";
        } catch (err) {
            console.error("[Storage] Load Error:", err);
            return "// Error loading file from Cloud.";
        }
    }

    async saveFile(filename, content) {
        if (!this.client) return;

        try {
            // Upsert (insert or update) based on the unique filename
            const { error } = await this.client
                .from('files')
                .upsert({ filename, content }, { onConflict: 'filename' });

            if (error) throw error;
            console.log(`[Storage] Synced ${filename} to Cloud.`);
        } catch (err) {
            console.error("[Storage] Save Error:", err);
        }
    }
}
