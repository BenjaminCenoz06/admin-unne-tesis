import { Info } from 'lucide-react';
import { requireAdmin, ROLE_LABEL, type Role } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { updateUser } from './actions';

export const dynamic = 'force-dynamic';

type Row = { id: string; email: string | null; full_name: string | null; role: Role; active: boolean; created_at: string };

export default async function Usuarios() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('id,email,full_name,role,active,created_at').order('created_at');
  const users = (data ?? []) as Row[];
  const roles = Object.keys(ROLE_LABEL) as Role[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios y roles</h1>
        <p className="text-sm text-slate-500">{users.length} usuario(s) con perfil en el panel.</p>
      </div>

      <p className="card flex items-start gap-3 p-4 text-sm text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span>
          Para sumar a alguien, crealo en Supabase (<i>Authentication → Users → Add user</i>). Aparece acá con rol
          Colaborador, que no tiene acceso al panel, hasta que le asignes Editor o superior.
        </span>
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="th">Usuario</th><th className="th">Rol</th><th className="th">Activo</th><th className="th" /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const locked = u.id === me.id || (u.role === 'superadmin' && me.role !== 'superadmin');
              const form = `u-${u.id}`;
              return (
                <tr key={u.id}>
                  <td className="td">
                    <p className="font-medium">{u.full_name || u.email}</p>
                    <p className="text-xs text-slate-500">{u.email}{u.id === me.id && ' · (vos)'}</p>
                  </td>
                  <td className="td">
                    <form id={form} action={updateUser.bind(null, u.id)} />
                    <select form={form} name="role" defaultValue={u.role} disabled={locked} className="input w-auto" aria-label={`Rol de ${u.email}`}>
                      {roles.filter((r) => r !== 'superadmin' || me.role === 'superadmin').map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                  </td>
                  <td className="td">
                    <input form={form} type="checkbox" name="active" defaultChecked={u.active} disabled={locked} className="h-4 w-4 accent-brand-600" aria-label={`Activo: ${u.email}`} />
                  </td>
                  <td className="td text-right">
                    <button form={form} type="submit" disabled={locked} className="btn btn-ghost btn-sm">Guardar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
