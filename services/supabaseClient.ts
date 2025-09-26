
import { createClient } from '@supabase/supabase-js';

// IMPORTANT:
// In a production environment, you should use environment variables to store sensitive credentials.
// For this application to work in this environment, we are hardcoding the values you provided.
const supabaseUrl = 'https://aitpmpscsqgjeuikgghw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdHBtcHNjc3FnamV1aWtnZ2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDM1MTUsImV4cCI6MjA3MDY3OTUxNX0.hISV2V5VHwjxYp7euCYxyFE2Db8wL5S4fiQDJ7FIlAM';

if (!supabaseUrl || !supabaseAnonKey) {
    // This check is a safeguard. With hardcoded values, it should not be triggered.
    throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
