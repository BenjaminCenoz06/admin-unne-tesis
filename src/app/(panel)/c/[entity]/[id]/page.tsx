import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { requireStaff } from '@/lib/auth';
import { getEntity } from '@/lib/entities';
import { resolveOptions } from '@/lib/options';
import { saveEntity } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';
import EntityForm, { type ClientField } from '@/components/EntityForm';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditEntity({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const e = getEntity(entity);
  if (!e) notFound();
  await requireStaff();
  const supabase = await createClient();
  const creating = id === 'nuevo';

  let row: Record<string, unknown> | null = null;
  if (!creating) {
    if (e.idType === 'uuid' && !UUID.test(id)) notFound();
    const { data } = await supabase.from(e.table).select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    row = data as Record<string, unknown>;
  }

  const fields: ClientField[] = [];
  for (const f of e.fields) {
    if (f.createOnly && !creating) continue;
    fields.push({
      name: f.name, label: f.label, type: f.type, required: f.required, help: f.help, wide: f.wide, min: f.min, max: f.max,
      maxLen: f.maxLen, upload: f.upload,
      options: f.type === 'select' ? await resolveOptions(supabase, f) : undefined,
    });
  }

  const initial: Record<string, string> = { status: String(row?.status ?? 'draft') };
  for (const f of fields) {
    const v = row?.[f.name];
    const start = e.fields.find((x) => x.name === f.name)?.initial ?? '';
    initial[f.name] = row ? (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v)) : start;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={`/c/${e.key}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" aria-hidden />{e.label}
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">
        {creating ? `Nuevo ${e.singular}` : `Editar ${e.singular}`}
      </h1>
      <EntityForm
        key={id}
        fields={fields}
        initial={initial}
        action={saveEntity.bind(null, e.key, creating ? null : id)}
        cancelHref={`/c/${e.key}`}
      />
    </div>
  );
}
