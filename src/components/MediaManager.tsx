'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FOLDERS, isImage, publicUrl, uploadToMedia } from '@/lib/upload';

type Item = { name: string; size: number; created: string; url: string; path: string };

const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function MediaManager({ canDelete }: { canDelete: boolean }) {
  const [folder, setFolder] = useState<string>(FOLDERS[0].id);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const pick = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient().storage.from('media').list(folder, {
      limit: 200, sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) {
      setItems([]);
      setMsg({ ok: false, text: 'No se pudo leer la biblioteca. ¿Ya ejecutaste la migración 002 en Supabase?' });
    } else {
      setItems((data ?? []).filter((f) => f.id).map((f) => ({
        name: f.name,
        size: Number((f.metadata as { size?: number } | null)?.size ?? 0),
        created: f.created_at ?? '',
        path: `${folder}/${f.name}`,
        url: publicUrl(`${folder}/${f.name}`),
      })));
    }
    setLoading(false);
  }, [folder]);

  useEffect(() => { void load(); }, [load]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    let okCount = 0;
    for (const f of Array.from(files)) {
      try { await uploadToMedia(f, folder); okCount++; } catch (e) { setMsg({ ok: false, text: `${f.name}: ${(e as Error).message}` }); }
    }
    if (okCount) setMsg((m) => m ?? { ok: true, text: `${okCount} archivo(s) subido(s).` });
    if (pick.current) pick.current.value = '';
    setBusy(false);
    await load();
  }

  async function remove(it: Item) {
    if (!window.confirm(`¿Eliminar "${it.name}"? Si algún libro o persona lo usa, dejará de verse.`)) return;
    const { error } = await createClient().storage.from('media').remove([it.path]);
    setMsg(error ? { ok: false, text: 'No se pudo eliminar (solo administradores).' } : { ok: true, text: 'Archivo eliminado.' });
    await load();
  }

  async function copy(url: string) {
    try { await navigator.clipboard.writeText(url); setCopied(url); setTimeout(() => setCopied(null), 1500); } catch { setMsg({ ok: false, text: 'No se pudo copiar. Seleccioná el link a mano.' }); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Carpetas">
          {FOLDERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={folder === f.id} onClick={() => { setFolder(f.id); setMsg(null); }}
              className={`btn btn-sm ${folder === f.id ? 'btn-primary' : 'btn-ghost'}`}>{f.label}</button>
          ))}
        </div>
        <div>
          <input ref={pick} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="sr-only" id="media-pick" onChange={(e) => void onFiles(e.target.files)} />
          <label htmlFor="media-pick" className={`btn btn-primary cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
            Subir archivos
          </label>
        </div>
      </div>

      {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
      <p className="text-xs text-slate-500">Imágenes JPG, PNG, WebP o GIF (hasta 10 MB) y PDF (hasta 50 MB). Los archivos son públicos: cualquiera con el link puede verlos.</p>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Cargando…</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">No hay archivos en esta carpeta todavía.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <li key={it.path} className="card overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                {isImage(it.name)
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.url} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                  : <FileText className="h-10 w-10 text-slate-400" aria-hidden />}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium" title={it.name}>{it.name}</p>
                <p className="text-xs text-slate-500">{fmtSize(it.size)}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => void copy(it.url)} className="btn btn-ghost btn-sm flex-1">
                    {copied === it.url ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                    {copied === it.url ? 'Copiado' : 'Copiar link'}
                  </button>
                  {canDelete && (
                    <button onClick={() => void remove(it)} className="btn btn-danger btn-sm" aria-label={`Eliminar ${it.name}`}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
