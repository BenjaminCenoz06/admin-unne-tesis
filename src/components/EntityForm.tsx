'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Loader2, Save, Trash2, Upload } from 'lucide-react';
import { STATUSES, STATUS_LABEL, type Option } from '@/lib/entities';
import type { FormState } from '@/lib/actions';
import { isImage, uploadToMedia } from '@/lib/upload';

export type ClientField = {
  name: string; label: string; type: 'text' | 'textarea' | 'number' | 'select' | 'tags';
  required?: boolean; options?: Option[]; help?: string; wide?: boolean; min?: number; max?: number; maxLen?: number;
  upload?: { folder: string; accept: string };
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

  // campos con subida de archivo: se controlan para completarlos con el link del archivo subido
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<Record<string, string>>({});
  const cur = (n: string) => uploaded[n] ?? val(n);
  async function pick(f: ClientField, file: File | undefined) {
    if (!file || !f.upload) return;
    setBusy(f.name);
    setUpErr((e) => ({ ...e, [f.name]: '' }));
    try {
      const { url } = await uploadToMedia(file, f.upload.folder);
      setUploaded((u) => ({ ...u, [f.name]: url }));
    } catch (e) {
      setUpErr((m) => ({ ...m, [f.name]: (e as Error).message }));
    } finally {
      setBusy(null);
    }
  }

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
            ) : f.upload ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id={f.name} name={f.name} value={cur(f.name)} className="input" placeholder="Link del archivo"
                    onChange={(e) => setUploaded((u) => ({ ...u, [f.name]: e.target.value }))}
                  />
                  <input
                    id={`${f.name}-file`} type="file" accept={f.upload.accept} className="sr-only"
                    onChange={(e) => { void pick(f, e.target.files?.[0]); e.target.value = ''; }}
                  />
                  <label htmlFor={`${f.name}-file`} className={`btn btn-ghost shrink-0 cursor-pointer ${busy === f.name ? 'pointer-events-none opacity-60' : ''}`}>
                    {busy === f.name ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
                    Subir
                  </label>
                  {cur(f.name) && (
                    <button type="button" className="btn btn-ghost shrink-0" aria-label={`Quitar ${f.label}`} onClick={() => setUploaded((u) => ({ ...u, [f.name]: '' }))}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
                {cur(f.name).startsWith('https://') && isImage(cur(f.name)) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cur(f.name)} alt="" className="h-24 rounded-lg border border-slate-200 object-cover" />
                )}
                {upErr[f.name] && <p className="text-xs text-red-600">{upErr[f.name]}</p>}
              </div>
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
