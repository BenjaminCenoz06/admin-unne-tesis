'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { STATUSES, STATUS_LABEL, type Option } from '@/lib/entities';
import type { FormState } from '@/lib/actions';

export type ClientField = {
  name: string; label: string; type: 'text' | 'textarea' | 'number' | 'select' | 'tags';
  required?: boolean; options?: Option[]; help?: string; wide?: boolean; min?: number; max?: number;
};

export default function EntityForm({
  fields, initial, action, cancelHref,
}: {
  fields: ClientField[];
  initial: Record<string, string>;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  // React 19 vacía los campos tras enviar: si hubo error se repone lo que el usuario había escrito.
  const val = (n: string) => state.values?.[n] ?? initial[n] ?? '';
  const err = (n: string) => state.errors?.[n];

  return (
    <form action={formAction} className="card space-y-5 p-6" noValidate>
      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label htmlFor={f.name} className="label">
              {f.label}{f.required && <span className="text-red-500"> *</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea id={f.name} name={f.name} rows={4} defaultValue={val(f.name)} className="input" />
            ) : f.type === 'select' ? (
              <select id={f.name} name={f.name} defaultValue={val(f.name)} className="input">
                {!f.required && <option value="">— Sin definir —</option>}
                {f.required && <option value="" disabled>Elegí una opción…</option>}
                {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                id={f.name} name={f.name} defaultValue={val(f.name)} className="input"
                type={f.type === 'number' ? 'number' : 'text'} inputMode={f.type === 'number' ? 'numeric' : undefined}
                min={f.min} max={f.max} step={f.type === 'number' ? 1 : undefined}
              />
            )}
            {f.help && !err(f.name) && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
            {err(f.name) && <p className="mt-1 text-xs text-red-600">{err(f.name)}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="status" className="label">Estado</label>
          <select id="status" name="status" defaultValue={val('status') || 'draft'} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <p className="mt-1 text-xs text-slate-500">Solo lo “Publicado” se muestra en el sitio.</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Link href={cancelHref} className="btn btn-ghost">Cancelar</Link>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Guardar
        </button>
      </div>
    </form>
  );
}
