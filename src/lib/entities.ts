import { BookOpen, CalendarDays, Folder, MapPin, MessageSquareQuote, Users, type LucideIcon } from 'lucide-react';

export const STATUSES = ['draft', 'pending', 'approved', 'published', 'archived'] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  approved: 'Aprobado',
  published: 'Publicado',
  archived: 'Archivado',
};

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'tags';
export type Option = { value: string; label: string };
export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  createOnly?: boolean;
  options?: Option[];
  optionsFrom?: { table: string; value: string; label: string };
  pattern?: RegExp;
  patternMsg?: string;
  min?: number;
  max?: number;
  maxLen?: number;
  /** Valor que se usa si el campo queda vacío (la base no admite nulos en estas columnas). */
  defaultValue?: number | string;
  /** Valor inicial al crear un registro nuevo. */
  initial?: string;
  /** Permite subir un archivo a la biblioteca y completar el campo con su link. */
  upload?: { folder: string; accept: string };
  help?: string;
  wide?: boolean;
};
export type Column = { name: string; label: string; kind?: 'text' | 'number' | 'tags' | 'rel' };
export type Entity = {
  key: string;
  table: string;
  label: string;
  singular: string;
  icon: LucideIcon;
  idType: 'uuid' | 'text';
  fields: Field[];
  columns: Column[];
  search: string[];
  order: { column: string; ascending: boolean };
  titleField: string;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Link https (archivo subido a la biblioteca) o ruta propia del sitio público
const MEDIA_PATH = /^(https:\/\/[^\s"'<>]+|(?:images|libros)\/[\w\-./]+)$/;
const HTTPS = /^https:\/\/[^\s"'<>]+$/;
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const ENTITIES: Entity[] = [
  {
    key: 'libros', table: 'books', label: 'Libros', singular: 'libro', icon: BookOpen, idType: 'uuid',
    titleField: 'title', order: { column: 'title', ascending: true }, search: ['title', 'author', 'slug'],
    columns: [
      { name: 'title', label: 'Título' }, { name: 'author', label: 'Autor' },
      { name: 'year', label: 'Año', kind: 'number' }, { name: 'category_id', label: 'Categoría', kind: 'rel' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, wide: true },
      { name: 'author', label: 'Autor', type: 'text', required: true },
      { name: 'slug', label: 'Identificador (URL)', type: 'text', required: true, pattern: SLUG, patternMsg: 'Solo minúsculas, números y guiones (ej: cien-anos-de-soledad)', help: 'Nombre del archivo: libros/<identificador>.pdf' },
      { name: 'category_id', label: 'Categoría', type: 'select', required: true, optionsFrom: { table: 'categories', value: 'id', label: 'title' } },
      { name: 'year', label: 'Año de publicación', type: 'number', min: 1000, max: 2100 },
      { name: 'pages', label: 'Páginas', type: 'number', min: 1, max: 20000 },
      { name: 'copies', label: 'Ejemplares', type: 'number', required: true, min: 0, max: 100000 },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 100000, defaultValue: 0 },
      { name: 'cover_path', label: 'Portada', type: 'text', wide: true, pattern: MEDIA_PATH, patternMsg: 'Subí una imagen o pegá un link https://', upload: { folder: 'portadas', accept: 'image/jpeg,image/png,image/webp' }, help: 'Si queda vacía, el sitio busca images/covers/<identificador>.jpg' },
      { name: 'pdf_path', label: 'Libro en PDF', type: 'text', wide: true, pattern: MEDIA_PATH, patternMsg: 'Subí un PDF o pegá un link https://', upload: { folder: 'libros', accept: 'application/pdf' }, help: 'Con PDF cargado, el libro muestra “Leer ahora”.' },
    ],
  },
  {
    key: 'categorias', table: 'categories', label: 'Categorías', singular: 'categoría', icon: Folder, idType: 'text',
    titleField: 'title', order: { column: 'position', ascending: true }, search: ['title', 'id'],
    columns: [{ name: 'title', label: 'Título' }, { name: 'id', label: 'Identificador' }, { name: 'position', label: 'Orden', kind: 'number' }],
    fields: [
      { name: 'id', label: 'Identificador', type: 'text', required: true, createOnly: true, pattern: SLUG, patternMsg: 'Solo minúsculas, números y guiones', help: 'No se puede cambiar después de crearla.' },
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000, defaultValue: 0 },
    ],
  },
  {
    key: 'equipo', table: 'team_members', label: 'Equipo', singular: 'integrante', icon: Users, idType: 'uuid',
    titleField: 'name', order: { column: 'position', ascending: true }, search: ['name', 'role'],
    columns: [{ name: 'name', label: 'Nombre' }, { name: 'role', label: 'Cargo' }, { name: 'position', label: 'Orden', kind: 'number' }],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'role', label: 'Cargo', type: 'text', required: true },
      { name: 'bio', label: 'Descripción', type: 'textarea', wide: true },
      { name: 'focus', label: 'Áreas de trabajo', type: 'tags', help: 'Separadas por coma', wide: true },
      { name: 'photo_url', label: 'Foto', type: 'text', wide: true, pattern: HTTPS, patternMsg: 'Subí una imagen o pegá un link https://', upload: { folder: 'equipo', accept: 'image/jpeg,image/png,image/webp' }, help: 'Si queda vacía, se usa la foto de images/team/<número>.png' },
      { name: 'img', label: 'Foto por defecto (número 1 a 5)', type: 'number', min: 1, max: 99, help: 'Se usa solo si no subiste una foto propia.' },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000, defaultValue: 0 },
    ],
  },
  {
    key: 'sedes', table: 'branches', label: 'Sedes', singular: 'sede', icon: MapPin, idType: 'uuid',
    titleField: 'name', order: { column: 'position', ascending: true }, search: ['name', 'addr'],
    columns: [{ name: 'name', label: 'Sede' }, { name: 'addr', label: 'Dirección' }, { name: 'tel', label: 'Teléfono' }],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'addr', label: 'Dirección', type: 'text' },
      { name: 'hours', label: 'Horario', type: 'text' },
      { name: 'tel', label: 'Teléfono', type: 'text' },
      { name: 'tag', label: 'Descripción corta', type: 'text', wide: true },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000, defaultValue: 0 },
    ],
  },
  {
    key: 'efemerides', table: 'events', label: 'Efemérides', singular: 'efeméride', icon: CalendarDays, idType: 'uuid',
    titleField: 'title', order: { column: 'month', ascending: true }, search: ['title', 'category'],
    columns: [{ name: 'title', label: 'Título' }, { name: 'month', label: 'Mes', kind: 'number' }, { name: 'day', label: 'Día', kind: 'number' }],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, wide: true },
      { name: 'month', label: 'Mes', type: 'select', required: true, options: MESES.map((l, i) => ({ value: String(i + 1), label: l })) },
      { name: 'day', label: 'Día', type: 'number', required: true, min: 1, max: 31 },
      { name: 'category', label: 'Categoría', type: 'text' },
      { name: 'summary', label: 'Resumen (tarjeta de la página)', type: 'textarea', wide: true, maxLen: 300, help: 'Texto corto que se ve en la tarjeta de la sección “Fechas para celebrar”.' },
      { name: 'body', label: 'Texto completo (ventana al abrir)', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'testimonios', table: 'testimonials', label: 'Testimonios', singular: 'testimonio', icon: MessageSquareQuote, idType: 'uuid',
    titleField: 'title', order: { column: 'position', ascending: true }, search: ['title', 'quote'],
    columns: [{ name: 'title', label: 'Quién habla' }, { name: 'quote', label: 'Cita' }, { name: 'position', label: 'Orden', kind: 'number' }],
    fields: [
      { name: 'title', label: 'Quién habla', type: 'text', required: true, help: 'Ej: Estudiantes, Familias, Docentes' },
      { name: 'quote', label: 'Cita', type: 'textarea', required: true, wide: true, maxLen: 300 },
      { name: 'tags', label: 'Etiquetas', type: 'text', help: 'Ej: Estudio · Salas silenciosas' },
      { name: 'initial', label: 'Inicial del avatar', type: 'text', required: true, maxLen: 2, initial: '' },
      { name: 'hue', label: 'Color del avatar (0 a 360)', type: 'number', required: true, min: 0, max: 360, initial: '150', help: '0 rojo · 60 amarillo · 150 verde · 220 azul · 300 violeta' },
      { name: 'height', label: 'Alto de la tarjeta (px)', type: 'number', required: true, min: 120, max: 320, initial: '190', help: 'Entre 120 y 320. Varíalo para que el muro se vea irregular.' },
      { name: 'link', label: 'Enlace del botón “Conocer más”', type: 'text', initial: '#servicios', help: 'Una sección (#servicios, #eventos…) o un link https://' },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000, defaultValue: 0 },
    ],
  },
];

export const getEntity = (key: string) => ENTITIES.find((e) => e.key === key);
