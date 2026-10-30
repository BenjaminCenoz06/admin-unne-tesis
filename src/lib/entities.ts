import { BookOpen, CalendarDays, Folder, MapPin, Users, type LucideIcon } from 'lucide-react';

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
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 100000 },
      { name: 'pdf_path', label: 'Ruta del PDF', type: 'text', help: 'Ej: libros/cien-anos-de-soledad.pdf' },
      { name: 'cover_path', label: 'Ruta de la portada', type: 'text', help: 'Ej: images/covers/cien-anos-de-soledad.jpg' },
    ],
  },
  {
    key: 'categorias', table: 'categories', label: 'Categorías', singular: 'categoría', icon: Folder, idType: 'text',
    titleField: 'title', order: { column: 'position', ascending: true }, search: ['title', 'id'],
    columns: [{ name: 'title', label: 'Título' }, { name: 'id', label: 'Identificador' }, { name: 'position', label: 'Orden', kind: 'number' }],
    fields: [
      { name: 'id', label: 'Identificador', type: 'text', required: true, createOnly: true, pattern: SLUG, patternMsg: 'Solo minúsculas, números y guiones', help: 'No se puede cambiar después de crearla.' },
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000 },
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
      { name: 'img', label: 'Foto (número 1 a 5)', type: 'number', min: 1, max: 99, help: 'Corresponde a images/team/<n>.png' },
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000 },
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
      { name: 'position', label: 'Orden', type: 'number', min: 0, max: 1000 },
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
      { name: 'body', label: 'Texto', type: 'textarea', wide: true },
    ],
  },
];

export const getEntity = (key: string) => ENTITIES.find((e) => e.key === key);
