# admin-unne-tesis · Administración de BiblioHub

Panel de administración independiente del sitio público (`BenjaminCenoz06/unne-tesis`).
Next.js 15 + TypeScript + Tailwind + Supabase (Auth + Postgres con RLS) + Zod + Lucide.

## Qué incluye hoy
- Login con correo y contraseña (Supabase Auth), límite de intentos, sesión por cookies seguras.
- Rutas protegidas por middleware **y** verificación de rol en el servidor en cada acción.
- Panel con cifras reales de la base y avisos de datos incompletos.
- Gestión de **Libros, Categorías, Equipo, Sedes y Efemérides**: crear, editar, publicar, archivar, eliminar (solo admin), búsqueda, filtro por estado, paginación y exportación CSV.
- **Usuarios y roles** (superadmin, admin, editor, colaborador, revisor) y **Auditoría** (solo lectura).
- Cabeceras de seguridad, `noindex` y `robots.txt` que bloquea todo.

- **Ajustes del sitio**: textos de portada y de cada sección, contacto y WhatsApp, redes sociales, aviso destacado, pie de página y color de acento.
- **Multimedia**: subir, ver, copiar el link y borrar portadas, PDF y fotos (Supabase Storage). Los libros y el equipo suben su archivo desde el propio formulario.
- **Testimonios** y **Efemérides** (con resumen para la tarjeta), además de **Duplicar** registros.
- El sitio público lee todo esto desde la base (con contenido de respaldo si la base no responde).

## Requiere la migración 002
Ejecutar `supabase/migration-002.sql` (repo del sitio público) en Supabase → SQL Editor. Crea testimonios, el bucket
`media` y los campos `photo_url` y `summary`. Hasta entonces esas secciones usan el contenido de siempre.

## Lo que NO está hecho todavía
Constructor de páginas con bloques, vista previa por dispositivo, versiones/comparación, programación de publicaciones,
edición del menú de navegación y copias de seguridad. Ver `docs/admin/PLAN-ADMIN.md` en el repo del sitio público.

## Variables de entorno
Copiá `.env.example` a `.env.local`. Solo se usan la URL y la clave **publishable**; la seguridad la dan las reglas RLS
de la base. **No se usa ni se necesita la clave secreta.** En Vercel cargá las mismas dos variables.

## Desarrollo
```bash
npm install
npm run dev      # http://localhost:3100
npm run build
```

## Base de datos
El esquema y los datos iniciales están en el repo del sitio público: `supabase/schema.sql` y `supabase/seed.sql`.

## Roles
Solo **superadmin, admin y editor** entran al panel. Un usuario nuevo creado en Supabase queda como *colaborador*
(sin acceso) hasta que un administrador le cambie el rol en **Usuarios y roles**.
