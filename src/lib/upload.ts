import { createClient } from '@/lib/supabase/client';

export const FOLDERS = [
  { id: 'portadas', label: 'Portadas de libros' },
  { id: 'libros', label: 'PDF de libros' },
  { id: 'equipo', label: 'Fotos del equipo' },
  { id: 'general', label: 'General' },
] as const;

const IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE = 10 * 1024 * 1024;
export const MAX_PDF = 50 * 1024 * 1024;

export const isImage = (name: string) => /\.(jpe?g|png|webp|gif)$/i.test(name);

/** Valida tipo y tamaño en el navegador (el servidor lo vuelve a exigir en el bucket). */
export function checkFile(file: File): string | null {
  if (file.type === 'application/pdf') return file.size > MAX_PDF ? 'El PDF supera los 50 MB.' : null;
  if (IMAGE.includes(file.type)) return file.size > MAX_IMAGE ? 'La imagen supera los 10 MB.' : null;
  return 'Formato no permitido. Usá JPG, PNG, WebP, GIF o PDF.';
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'archivo';

export function publicUrl(path: string): string {
  return createClient().storage.from('media').getPublicUrl(path).data.publicUrl;
}

/** Sube un archivo al bucket "media" y devuelve su link público. */
export async function uploadToMedia(file: File, folder: string): Promise<{ path: string; url: string }> {
  const problem = checkFile(file);
  if (problem) throw new Error(problem);
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = slugify(file.name.replace(/\.[^.]+$/, ''));
  const path = `${folder}/${base}-${Date.now().toString(36)}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type, upsert: false, cacheControl: '31536000',
  });
  if (error) throw new Error('No se pudo subir el archivo. Revisá que tu rol permita subir y que el bucket "media" exista.');
  return { path, url: publicUrl(path) };
}
