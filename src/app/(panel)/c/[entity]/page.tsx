import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Download, Pencil, Plus, Search } from 'lucide-react';
import { ADMIN_ROLES, requireStaff } from '@/lib/auth';
import { getEntity, STATUSES, STATUS_LABEL, type Status } from '@/lib/entities';
import { resolveOptions } from '@/lib/options';
import { deleteEntity, setStatus } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';
import ConfirmButton from '@/components/ConfirmButton';

export const dynamic = 'force-dynamic';
const PAGE = 20;

const BADGE: Record<Status, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-zinc-200 text-zinc-600',
};

type SP = { q?: string; status?: string; page?: string; error?: string };

export default async function EntityList({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<SP> }) {
  const { entity } = await params;
  const sp = await searchParams;
  const e = getEntity(entity);
  if (!e) notFound();
  const profile = await requireStaff();
  const isAdmin = ADMIN_ROLES.includes(profile.role);
  const supabase = await createClient();

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const q = (sp.q ?? '').replace(/[,()%*\\]/g, ' ').trim().slice(0, 80);
  const status = (STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as Status) : null;

  let query = supabase
    .from(e.table)
    .select('*', { count: 'exact' })
    .order(e.order.column, { ascending: e.order.ascending })
    .order('id')
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (status) query = query.eq('status', status);
  if (q) query = query.or(e.search.map((c) => `${c}.ilike.%${q}%`).join(','));
  const { data, count, error } = await query;

  // etiquetas de relaciones (ej. categoría de un libro)
  const rel: Record<string, Map<string, string>> = {};
  for (const c of e.columns.filter((c) => c.kind === 'rel')) {
    const f = e.fields.find((x) => x.name === c.name);
    if (f) rel[c.name] = new Map((await resolveOptions(supabase, f)).map((o) => [o.value, o.label]));
  }

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    if (status) u.set('status', status);
    if (p > 1) u.set('page', String(p));
    const s = u.toString();
    return `/c/${e.key}${s ? `?${s}` : ''}`;
  };
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{e.label}</h1>
          <p className="text-sm text-slate-500">{total} registro(s)</p>
        </div>
        <div className="flex gap-2">
          <a href={`/c/${e.key}/export`} className="btn btn-ghost"><Download className="h-4 w-4" aria-hidden />Exportar CSV</a>
          <Link href={`/c/${e.key}/nuevo`} className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden />Nuevo</Link>
        </div>
      </div>

      {sp.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">No se pudo cargar la lista.</p>}

      <form className="flex flex-wrap gap-2" role="search">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
          <input name="q" defaultValue={q} placeholder={`Buscar en ${e.label.toLowerCase()}…`} className="input pl-9" aria-label="Buscar" />
        </div>
        <select name="status" defaultValue={status ?? ''} className="input w-auto" aria-label="Estado">
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn btn-ghost" type="submit">Filtrar</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {e.columns.map((c) => <th key={c.name} className="th">{c.label}</th>)}
              <th className="th">Estado</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td className="td text-slate-500" colSpan={e.columns.length + 2}>No hay resultados.</td></tr>
            )}
            {rows.map((r) => {
              const id = String(r.id);
              const st = r.status as Status;
              return (
                <tr key={id} className="hover:bg-slate-50/60">
                  {e.columns.map((c) => {
                    const v = r[c.name];
                    const text = c.kind === 'rel' ? rel[c.name]?.get(String(v)) ?? '—' : v == null || v === '' ? '—' : String(v);
                    return <td key={c.name} className={`td ${c.name === e.titleField ? 'font-medium' : 'text-slate-600'}`}>{text}</td>;
                  })}
                  <td className="td"><span className={`badge ${BADGE[st] ?? BADGE.draft}`}>{STATUS_LABEL[st] ?? st}</span></td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/c/${e.key}/${encodeURIComponent(id)}`} className="btn btn-ghost btn-sm"><Pencil className="h-3.5 w-3.5" aria-hidden />Editar</Link>
                      {st === 'published' ? (
                        <ConfirmButton action={setStatus.bind(null, e.key, id, 'archived')} message="¿Archivar? Dejará de verse en el sitio." className="btn btn-ghost btn-sm">Archivar</ConfirmButton>
                      ) : (
                        <ConfirmButton action={setStatus.bind(null, e.key, id, 'published')} message="¿Publicar? Se mostrará en el sitio." className="btn btn-ghost btn-sm">Publicar</ConfirmButton>
                      )}
                      {isAdmin && (
                        <ConfirmButton action={deleteEntity.bind(null, e.key, id)} message="¿Eliminar definitivamente? No se puede deshacer." className="btn btn-danger btn-sm">Eliminar</ConfirmButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Paginación">
          <span className="text-slate-500">Página {page} de {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href(page - 1)} className="btn btn-ghost btn-sm"><ChevronLeft className="h-4 w-4" aria-hidden />Anterior</Link>}
            {page < pages && <Link href={href(page + 1)} className="btn btn-ghost btn-sm">Siguiente<ChevronRight className="h-4 w-4" aria-hidden /></Link>}
          </div>
        </nav>
      )}
    </div>
  );
}
