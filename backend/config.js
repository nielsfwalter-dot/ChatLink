
/* =========================================
   CHATLINK 2.1 – CONFIGURATION
========================================= */

const SUPABASE_URL =
    "https://audoixsmvwizddgmjovl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    sb_publishable_TIZrWw4cHh5qOz3U2F-znA_cAzQI8bC

if (!window.supabase) {
    throw new Error("Supabase SDK wurde nicht geladen.");
}

export const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

console.log("ChatLink 2.1 – Supabase initialisiert.");
