'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/auth';

export type LoginState = { error?: string };

// Límite de intentos por IP + correo (en memoria: protege cada instancia; Supabase aplica además el suyo).
const attempts = new Map<string, { n: number; t: number }>();
const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000;

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Ingresá un correo y una contraseña válidos.' };
  const { email, password } = parsed.data;

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const key = `${ip}|${email}`;
  const now = Date.now();
  const rec = attempts.get(key);
  if (rec && now - rec.t < WINDOW_MS && rec.n >= MAX) {
    return { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    attempts.set(key, rec && now - rec.t < WINDOW_MS ? { n: rec.n + 1, t: rec.t } : { n: 1, t: now });
    return { error: 'Correo o contraseña incorrectos.' };
  }
  attempts.delete(key);
  await logAudit('login', 'session', null);
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await logAudit('logout', 'session', null);
  await supabase.auth.signOut();
  redirect('/login');
}
