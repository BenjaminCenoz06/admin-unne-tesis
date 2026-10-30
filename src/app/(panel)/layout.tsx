import Shell from '@/components/Shell';
import { ADMIN_ROLES, ROLE_LABEL, requireStaff } from '@/lib/auth';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const p = await requireStaff();
  return (
    <Shell
      name={p.full_name || p.email || 'Usuario'}
      email={p.email ?? ''}
      roleLabel={ROLE_LABEL[p.role]}
      isAdmin={ADMIN_ROLES.includes(p.role)}
    >
      {children}
    </Shell>
  );
}
