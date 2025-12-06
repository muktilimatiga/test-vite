
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Replace these with your actual Project URL and Anon Key from Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://rrtpzwkdnockcfpvczar.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydHB6d2tkbm9ja2NmcHZjemFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI3MDksImV4cCI6MjA3OTgwODcwOX0.lW-V0OSe5G8PgAt0i-AA8vC_jsAoLPUeYW_MGmkO0Rw';

// Validate configuration to prevent runtime crashes
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : 'https://placeholder-project.supabase.co';
const key = SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false // Prevent issues in some sandbox environments
  }
});