import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://swqhvomhgnzjwznablnm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cWh2b21oZ256and6bmFibG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzI2NjgsImV4cCI6MjEwNjU0ODY2OH0.D9uAk0mC9a-WBcjN9OQb77T_WcsmhO-eg-aceRFwiRs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
