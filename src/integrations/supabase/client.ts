import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use Vite environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dsxnahdynbvdkibzozod.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeG5haGR5bmJ2ZGtpYnpvem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTE3MTAsImV4cCI6MjA2ODA2NzcxMH0.IwfGskmK1Ccvfpd6jrLs93NFMu0tkgcMDInm09AKrv4";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-dsxnahdynbvdkibzozod-auth-token',
      flowType: 'pkce',
      debug: import.meta.env.DEV,
    },
    global: {
      headers: {
        'X-Client-Info': 'logisimple-fleet-insight-hub/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  }
);