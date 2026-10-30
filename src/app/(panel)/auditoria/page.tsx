import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Row = { id: number; user_id: string | null; action: string; entity: string; entity_id: string | null; detail: Record<string, unknown> | null; created_at: string };

export default async function Auditoria() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data }, { data: people }] = await Promise.all([
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('profiles').select('id,email'),
  ]);
  const who = new Map((people ?? []).map((p) => [p.id as string, p.email as string]));
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
        <p className="text-sm text-slate-500">Últimos {rows.length} movimientos. El registro es de solo lectura.</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="th">Fecha</th><th className="th">Usuario</th><th className="th">Acción</th><th className="th">Sobre</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td className="td text-slate-500" colSpan={4}>Sin movimientos todavía.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td whitespace-nowrap text-slate-600">{new Date(r.created_at).toLocaleString('es-AR')}</td>
                <td className="td">{(r.user_id && who.get(r.user_id)) || '—'}</td>
                <td className="td font-medium">{r.action}</td>
                <td className="td text-slate-600">{r.entity}{typeof r.detail?.title === 'string' ? ` · ${r.detail.title}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
