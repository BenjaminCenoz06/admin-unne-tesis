'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAudit, requireAdmin } from '@/lib/auth';
import { ALL_SETTING_FIELDS, type SettingField } from '@/lib/settings';

export type SettingsState = { ok?: boolean; message?: string; errors?: Record<string, string>; values?: Record<string, string> };

function check(f: SettingField, v: string): string | null {
  if (f.max && v.length > f.max) return `Máximo ${f.max} caracteres.`;
  switch (f.type) {
    case 'email': return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v) ? null : 'Correo inválido.';
    case 'wa': return /^\d{8,15}$/.test(v) ? null : 'Solo números, entre 8 y 15 dígitos (sin + ni espacios).';
    case 'phone': return /^[\d\s()+\-]{6,30}$/.test(v) ? null : 'Teléfono inválido.';
    case 'color': return /^#[0-9a-f]{6}$/i.test(v) ? null : 'Usá el formato #RRGGBB.';
    case 'url':
      if (f.key === 'announce_link') return /^(https:\/\/[^\s"'<>]+|#[\w-]+)$/.test(v) ? null : 'Usá un link https://… o una sección como #eventos.';
      return /^https:\/\/[^\s"'<>]+$/.test(v) ? null : 'El link debe empezar con https://';
    default: return null;
  }
}

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const value: Record<string, string> = {};
  const raw: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const f of ALL_SETTING_FIELDS) {
    if (f.type === 'bool') {
      const on = formData.get(f.key) === 'on';
      raw[f.key] = on ? 'on' : '';
      if (on) value[f.key] = 'true';
      continue;
    }
    const v = String(formData.get(f.key) ?? '').replace(/\r\n/g, '\n').trim();
    raw[f.key] = v;
    if (!v) continue; // vacío = se usa el texto original de la página
    const problem = check(f, v);
    if (problem) errors[f.key] = problem;
    else value[f.key] = v;
  }
  if (value.announce_active && !value.announce_text) errors.announce_text = 'Escribí el texto del aviso o desactivá la opción.';
  if (Object.keys(errors).length) return { errors, values: raw, message: 'Revisá los campos marcados.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'site', value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { values: raw, message: 'No se pudo guardar. Intentá de nuevo.' };

  await logAudit('settings:update', 'site_settings', 'site', { campos: Object.keys(value).length });
  revalidatePath('/ajustes');
  return { ok: true, values: raw, message: 'Cambios guardados. El sitio los muestra al recargar la página.' };
}
