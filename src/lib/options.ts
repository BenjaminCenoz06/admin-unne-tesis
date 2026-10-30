import type { SupabaseClient } from '@supabase/supabase-js';
import type { Field, Option } from '@/lib/entities';

/** Opciones de un campo "select": fijas o leídas de otra tabla (ej. categorías de un libro). */
export async function resolveOptions(supabase: SupabaseClient, field: Field): Promise<Option[]> {
  if (field.options) return field.options;
  if (!field.optionsFrom) return [];
  const { table, value, label } = field.optionsFrom;
  const { data } = await supabase.from(table).select(`${value},${label}`).order(label);
  return (data ?? []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    return { value: String(row[value]), label: String(row[label]) };
  });
}
