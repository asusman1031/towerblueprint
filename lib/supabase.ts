import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The browser never talks to Supabase directly. All reads and writes go
// through the Next.js server, and private data is reachable only through the
// database functions defined in supabase/migrations.

let client: SupabaseClient | null | undefined;

export function db(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function dbReady() {
  return db() !== null;
}
