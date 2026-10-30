import { ADMIN_ROLES, requireStaff } from '@/lib/auth';
import MediaManager from '@/components/MediaManager';

export const dynamic = 'force-dynamic';

export default async function Multimedia() {
  const p = await requireStaff();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Multimedia</h1>
        <p className="text-sm text-slate-500">Portadas, PDF y fotos del sitio. Se guardan en la nube, no dentro del código.</p>
      </div>
      <MediaManager canDelete={ADMIN_ROLES.includes(p.role)} />
    </div>
  );
}
