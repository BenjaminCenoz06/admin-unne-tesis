import { createBrowserClient } from '@supabase/ssr';

/** Cliente del navegador: usa la sesión del usuario y las mismas reglas RLS. Solo claves públicas. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
