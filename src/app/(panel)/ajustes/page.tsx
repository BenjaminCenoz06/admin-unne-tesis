import { ExternalLink } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function Ajustes() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'site').maybeSingle();
  const stored = ((data?.value ?? {}) as Record<string, string>);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ajustes del sitio</h1>
          <p className="text-sm text-slate-500">Textos, contacto, redes, aviso y color de la página pública.</p>
        </div>
        <a href="https://unne-tesis.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          <ExternalLink className="h-4 w-4" aria-hidden />Ver el sitio
        </a>
      </div>
      <SettingsForm stored={stored} />
    </div>
  );
}
