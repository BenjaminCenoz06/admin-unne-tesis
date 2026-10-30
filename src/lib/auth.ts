import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'superadmin' | 'admin' | 'editor' | 'colaborador' | 'revisor';
export type Profile = { id: string; email: string | null; full_name: string | null; role: Role; active: boolean };

export const STAFF_ROLES: Role[] = ['superadmin', 'admin', 'editor'];
export const ADMIN_ROLES: Role[] = ['superadmin', 'admin'];
export const ROLE_LABEL: Record<Role, string> = {
  superadmin: 'Superadministrador',
  admin: 'Administrador',
  editor: 'Editor',
  colaborador: 'Colaborador',
  revisor: 'Revisor',
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,active')
    .eq('id', user.id)
    .maybeSingle();
  return data && data.active ? (data as Profile) : null;
}

/** Exige sesión y rol con acceso al panel. Se verifica siempre en el servidor. */
export async function requireStaff(): Promise<Profile> {
  const p = await getProfile();
  if (!p) redirect('/login');
  if (!STAFF_ROLES.includes(p.role)) redirect('/sin-acceso');
  return p;
}

export async function requireAdmin(): Promise<Profile> {
  const p = await requireStaff();
  if (!ADMIN_ROLES.includes(p.role)) redirect('/dashboard');
  return p;
}

export async function logAudit(action: string, entity: string, entityId: string | null, detail?: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('audit_log').insert({ user_id: user.id, action, entity, entity_id: entityId, detail: detail ?? null });
}
