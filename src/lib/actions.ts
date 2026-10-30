'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logAudit, requireAdmin, requireStaff } from '@/lib/auth';
import { getEntity, STATUSES, type Entity } from '@/lib/entities';

export type FormState = { message?: string; errors?: Record<string, string>; values?: Record<string, string> };

function schemaFor(e: Entity, creating: boolean) {
  const shape: Record<string, z.ZodTypeAny> = { status: z.enum(STATUSES) };
  for (const f of e.fields) {
    if (f.createOnly && !creating) continue;
    const req = `${f.label} es obligatorio`;
    if (f.type === 'number') {
      const n = z
        .number({ error: `${f.label} debe ser un número entero` })
        .int(`${f.label} debe ser un número entero`)
        .min(f.min ?? -1e9, `${f.label} no puede ser menor que ${f.min}`)
        .max(f.max ?? 1e9, `${f.label} no puede ser mayor que ${f.max}`);
      shape[f.name] = z.preprocess(
        (v) => (v === '' || v == null ? (f.defaultValue ?? null) : Number(v)),
        f.required ? n : n.nullable(),
      );
    } else if (f.type === 'tags') {
      shape[f.name] = z.preprocess(
        (v) => String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean),
        z.array(z.string().max(120)).max(20),
      );
    } else if (f.type === 'select') {
      const s = z.string().trim().max(200);
      shape[f.name] = f.required ? s.min(1, req) : z.preprocess((v) => (v === '' ? null : v), s.nullable());
    } else {
      let s = z.string().trim().max(f.maxLen ?? (f.type === 'textarea' ? 4000 : 300), `${f.label}: máximo ${f.maxLen ?? (f.type === 'textarea' ? 4000 : 300)} caracteres`);
      if (f.pattern) s = s.regex(f.pattern, f.patternMsg ?? `${f.label} tiene un formato inválido`);
      shape[f.name] = f.required ? s.min(1, req) : z.preprocess((v) => (v === '' ? null : v), s.nullable());
    }
  }
  return z.object(shape);
}

function dbMessage(error: { code?: string }) {
  if (error.code === '23505') return 'Ya existe un registro con ese identificador.';
  if (error.code === '23503') return 'La categoría elegida no existe o el registro está en uso.';
  if (error.code === '23514') return 'Algún valor está fuera del rango permitido.';
  return 'No se pudo guardar. Intentá de nuevo.';
}

export async function saveEntity(entityKey: string, id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const e = getEntity(entityKey);
  if (!e) return { message: 'La sección no existe.' };
  const creating = id === null;

  const raw: Record<string, string> = { status: String(formData.get('status') ?? 'draft') };
  for (const f of e.fields) {
    if (f.createOnly && !creating) continue;
    raw[f.name] = String(formData.get(f.name) ?? '');
  }

  const parsed = schemaFor(e, creating).safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0] ?? '_')] ??= i.message;
    return { errors, values: raw, message: 'Revisá los campos marcados.' };
  }

  const payload = parsed.data as Record<string, unknown>;
  const supabase = await createClient();
  let savedId = id;
  if (creating) {
    const { data, error } = await supabase.from(e.table).insert(payload).select('id').single();
    if (error) return { message: dbMessage(error), values: raw };
    savedId = String(data.id);
  } else {
    const { data, error } = await supabase
      .from(e.table)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id');
    if (error) return { message: dbMessage(error), values: raw };
    if (!data?.length) return { message: 'No se pudo guardar: el registro no existe o no tenés permiso.', values: raw };
  }

  await logAudit(creating ? 'create' : 'update', e.table, savedId, { title: payload[e.titleField] ?? null });
  revalidatePath(`/c/${e.key}`);
  revalidatePath('/dashboard');
  redirect(`/c/${e.key}`);
}

export async function setStatus(entityKey: string, id: string, status: string): Promise<void> {
  await requireStaff();
  const e = getEntity(entityKey);
  const ok = (STATUSES as readonly string[]).includes(status);
  if (!e || !ok) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from(e.table)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (data?.length) await logAudit(`status:${status}`, e.table, id);
  revalidatePath(`/c/${e.key}`);
  revalidatePath('/dashboard');
}

/** Crea una copia en borrador del registro (no aplica a categorías, cuyo identificador es fijo). */
export async function duplicateEntity(entityKey: string, id: string): Promise<void> {
  await requireStaff();
  const e = getEntity(entityKey);
  if (!e || e.idType !== 'uuid') return;
  const supabase = await createClient();
  const { data: row } = await supabase.from(e.table).select('*').eq('id', id).maybeSingle();
  if (!row) return;

  const copy: Record<string, unknown> = { ...row, status: 'draft' };
  for (const k of ['id', 'created_at', 'updated_at']) delete copy[k];
  copy[e.titleField] = `${String(row[e.titleField] ?? '')} (copia)`.slice(0, 300);
  if (typeof copy.slug === 'string') copy.slug = `${copy.slug}-copia-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase.from(e.table).insert(copy).select('id').single();
  if (error || !data) redirect(`/c/${e.key}?error=${encodeURIComponent('No se pudo duplicar.')}`);
  await logAudit('duplicate', e.table, String(data.id), { title: copy[e.titleField] });
  revalidatePath(`/c/${e.key}`);
  redirect(`/c/${e.key}/${data.id}`);
}

export async function deleteEntity(entityKey: string, id: string): Promise<void> {
  await requireAdmin();
  const e = getEntity(entityKey);
  if (!e) return;
  const supabase = await createClient();
  const { error } = await supabase.from(e.table).delete().eq('id', id);
  if (error) {
    redirect(`/c/${e.key}?error=${encodeURIComponent('No se pudo eliminar: el registro está en uso.')}`);
  }
  await logAudit('delete', e.table, id);
  revalidatePath(`/c/${e.key}`);
  revalidatePath('/dashboard');
}
