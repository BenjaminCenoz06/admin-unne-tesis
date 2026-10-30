import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { ADMIN_ROLES, requireStaff } from '@/lib/auth';
import { ENTITIES } from '@/lib/entities';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type AuditRow = { id: number; action: string; entity: string; created_at: string; detail: { title?: string } | null };

export default async function Dashboard() {
  const profile = await requireStaff();
  const supabase = await createClient();
  const count = async (table: string, filter?: (q: any) => any) => {
    let q: any = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: c } = await q;
    return (c ?? 0) as number;
  };

  const rows = await Promise.all(
    ENTITIES.map(async (e) => ({ e, total: await count(e.table), published: await count(e.table, (q) => q.eq('status', 'published')) })),
  );
  const [sinPdf, sinAnio, sinPortada] = await Promise.all([
    count('books', (q) => q.is('pdf_path', null)),
    count('books', (q) => q.is('year', null)),
    count('books', (q) => q.is('cover_path', null)),
  ]);

  const isAdmin = ADMIN_ROLES.includes(profile.role);
  let recent: AuditRow[] = [];
  if (isAdmin) {
    const { data } = await supabase.from('audit_log').select('id,action,entity,created_at,detail').order('created_at', { ascending: false }).limit(8);
    recent = (data ?? []) as AuditRow[];
  }

  const warnings = [
    sinPdf && `${sinPdf} libro(s) sin PDF`,
    sinAnio && `${sinAnio} libro(s) sin año`,
    sinPortada && `${sinPortada} libro(s) sin portada`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola{profile.full_name ? `, ${profile.full_name}` : ''}</h1>
        <p className="text-sm text-slate-500">Resumen real del contenido guardado en la base de datos.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Contenido">
        {rows.map(({ e, total, published }) => (
          <Link key={e.key} href={`/c/${e.key}`} className="card group p-5 transition hover:border-brand-500">
            <div className="flex items-center justify-between">
              <e.icon className="h-5 w-5 text-brand-600" aria-hidden />
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{total}</p>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-slate-500">{published} publicados · {total - published} sin publicar</p>
          </Link>
        ))}
      </section>

      {warnings.length > 0 && (
        <section className="card flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Datos por completar</p>
            <p>{warnings.join(' · ')}</p>
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="font-medium">Actividad reciente</h2>
            <Link href="/auditoria" className="text-sm text-brand-600 hover:underline">Ver todo</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Todavía no hay actividad registrada.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span><b className="font-medium">{r.action}</b> · {r.entity}{r.detail?.title ? ` · ${r.detail.title}` : ''}</span>
                  <time className="shrink-0 text-xs text-slate-500" dateTime={r.created_at}>{new Date(r.created_at).toLocaleString('es-AR')}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
