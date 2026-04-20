import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente "${name}" não definida no .env`);
  return value;
}

const supabaseUrl            = requireEnv("SUPABASE_URL");
const supabaseAnonKey        = requireEnv("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const BASE_AUTH_OPTIONS = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const;

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, BASE_AUTH_OPTIONS);
}

export function createSupabaseAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, BASE_AUTH_OPTIONS);
}
