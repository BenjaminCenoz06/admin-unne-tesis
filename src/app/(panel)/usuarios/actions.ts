'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logAudit, requireAdmin, type Role } from '@/lib/auth';

const ROLES = ['superadmin', 'admin', 'editor', 'colaborador', 'revisor'] as const;

export async function updateUser(userId: string, formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const parsed = z.object({ role: z.enum(ROLES), active: z.boolean() }).safeParse({
    role: formData.get('role'),
    active: formData.get('active') === 'on',
  });
  if (!parsed.success || !z.string().uuid().safeParse(userId).success) return;
  const { role, active } = parsed.data;

  // Nadie se modifica a sí mismo (evita quedarse sin acceso) y solo un superadmin toca a otro superadmin.
  if (userId === me.id) return;
  const supabase = await createClient();
  const { data: target } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!target) return;
  const involvesSuper = (target.role as Role) === 'superadmin' || role === 'superadmin';
  if (involvesSuper && me.role !== 'superadmin') return;

  const { data } = await supabase.from('profiles').update({ role, active }).eq('id', userId).select('id');
  if (data?.length) await logAudit('user:update', 'profiles', userId, { role, active });
  revalidatePath('/usuarios');
}
