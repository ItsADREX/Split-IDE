import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pqlbcpsgqwqurrhuiadq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbGJjcHNncXdxdXJyaHVpYWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE0ODQsImV4cCI6MjA5MTA3NzQ4NH0.ClHQI4x7wHK43-4syv8C4yx08lx2SkZ3-4296Y-Axdo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
