'use client';

import { useActionState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { SETTING_GROUPS, type SettingField } from '@/lib/settings';
import { saveSettings, type SettingsState } from './actions';

export default function SettingsForm({ stored }: { stored: Record<string, string> }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  // React 19 vacía los campos al enviar: se reponen con lo que escribió el usuario
  const val = (f: SettingField) => state.values?.[f.key] ?? (f.type === 'bool' ? (stored[f.key] === 'true' ? 'on' : '') : stored[f.key] ?? '');

  const input = (f: SettingField) => {
    const common = { id: f.key, name: f.key, className: 'input', placeholder: f.def || undefined };
    if (f.type === 'bool') {
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" id={f.key} name={f.key} defaultChecked={val(f) === 'on'} className="h-4 w-4 accent-brand-600" />
          Activado
        </label>
      );
    }
    if (f.type === 'textarea') return <textarea {...common} rows={3} defaultValue={val(f)} maxLength={f.max} />;
    if (f.type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <input {...common} defaultValue={val(f)} maxLength={7} className="input max-w-[160px] font-mono" />
          <span className="h-9 w-9 rounded-lg border border-slate-200" style={{ background: /^#[0-9a-f]{6}$/i.test(val(f)) ? val(f) : f.def }} aria-hidden />
        </div>
      );
    }
    return <input {...common} type={f.type === 'email' ? 'email' : 'text'} defaultValue={val(f)} maxLength={f.max} />;
  };

  return (
    <form action={action} className="space-y-6" noValidate>
      <nav className="card sticky top-2 z-10 flex flex-wrap gap-1.5 p-2 text-sm" aria-label="Secciones">
        {SETTING_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100">
            <g.icon className="h-3.5 w-3.5" aria-hidden />{g.label}
          </a>
        ))}
      </nav>

      {SETTING_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="card scroll-mt-20 p-6">
          <div className="mb-5 flex items-start gap-3">
            <g.icon className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden />
            <div>
              <h2 className="font-semibold">{g.label}</h2>
              <p className="text-sm text-slate-500">{g.desc}</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label htmlFor={f.key} className="label">{f.label}</label>
                {input(f)}
                {state.errors?.[f.key]
                  ? <p className="mt-1 text-xs text-red-600">{state.errors[f.key]}</p>
                  : f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="card sticky bottom-3 flex flex-wrap items-center justify-between gap-3 p-4">
        <p role="status" className={`flex items-center gap-2 text-sm ${state.ok ? 'text-emerald-700' : state.message ? 'text-red-700' : 'text-slate-500'}`}>
          {state.ok && <CheckCircle2 className="h-4 w-4" aria-hidden />}
          {state.message ?? 'Los campos vacíos usan el texto original de la página.'}
        </p>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
