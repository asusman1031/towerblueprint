import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The browser never talks to Supabase directly. All reads and writes go
// through the Next.js server, and private data is reachable only through the
// database functions defined in supabase/migrations.

// Production project ("towerbuild"). The anon key is public by design: it only
// reaches read-only public tables and the validated functions, and HQ functions
// also require a passcode session. Environment variables override these.
const DEFAULT_URL = "https://naxgdachxdvoccvcoxtn.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heGdkYWNoeGR2b2NjdmNveHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTUwODAsImV4cCI6MjEwNzMzMTA4MH0.hh9s8iW60stMMb3J-_hvvRjfh7zq2fvRrK0OSeH5TpQ";

let client: SupabaseClient | null | undefined;

export function db(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function dbReady() {
  return db() !== null;
}
