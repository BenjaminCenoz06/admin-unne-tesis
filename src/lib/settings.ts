import { Bell, Heading, Mail, Megaphone, Palette, PanelBottom, Share2, type LucideIcon } from 'lucide-react';

export type SettingType = 'text' | 'textarea' | 'email' | 'phone' | 'wa' | 'url' | 'bool' | 'color';
export type SettingField = {
  key: string;
  label: string;
  type: SettingType;
  /** Texto que la página muestra hoy. Si el campo queda vacío, se usa este. */
  def: string;
  help?: string;
  max?: number;
};
export type SettingGroup = { id: string; label: string; desc: string; icon: LucideIcon; fields: SettingField[] };

// Las claves coinciden con las que lee js/cms.js en el sitio público.
export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'inicio', label: 'Portada', icon: Megaphone, desc: 'Lo primero que ve el visitante al entrar.',
    fields: [
      { key: 'hero_eyebrow', label: 'Texto pequeño superior', type: 'text', def: 'Bienvenidos a', max: 60 },
      { key: 'hero_line1', label: 'Título · línea 1', type: 'text', def: 'Tu biblioteca,', max: 60 },
      { key: 'hero_line2_pre', label: 'Título · línea 2 (texto normal)', type: 'text', def: 'siempre', max: 40 },
      { key: 'hero_line2_em', label: 'Título · línea 2 (palabra destacada)', type: 'text', def: 'a mano', max: 40 },
      { key: 'hero_lead', label: 'Descripción', type: 'textarea', def: 'Libros, archivos digitales, eventos y espacios para leer, aprender y crear. Todo en un solo lugar.', max: 240 },
      { key: 'hero_btn1', label: 'Botón principal', type: 'text', def: 'Explorar libros', max: 30 },
      { key: 'hero_btn2', label: 'Botón secundario', type: 'text', def: 'Obtener mi carnet', max: 30 },
    ],
  },
  {
    id: 'titulos', label: 'Títulos de secciones', icon: Heading, desc: 'Para cortar una línea en dos, apretá Enter dentro del texto.',
    fields: [
      { key: 'borrow_title', label: 'Catálogo', type: 'text', def: 'Leer, ver y pedir prestado', max: 90 },
      { key: 'spot_title', label: 'Efemérides', type: 'text', def: 'Fechas para celebrar la literatura', max: 90 },
      { key: 'branch_title', label: 'Sedes', type: 'text', def: 'Encuentra tu sucursal', max: 90 },
      { key: 'pride_title', label: 'Motivos para leer', type: 'text', def: 'Motivos para leer e ir a la biblioteca', max: 90 },
      { key: 'research_title', label: 'Investigación', type: 'textarea', def: 'Archivos, colecciones y\nconocimiento abierto', max: 120 },
      { key: 'voices_title', label: 'Testimonios', type: 'textarea', def: 'Lo que cambia cuando\nla biblioteca trabaja para vos', max: 120 },
      { key: 'about_title', label: 'Acerca de', type: 'textarea', def: 'Una biblioteca abierta,\nhecha para la comunidad', max: 120 },
      { key: 'team_title', label: 'Equipo', type: 'text', def: 'El equipo BiblioHub', max: 90 },
    ],
  },
  {
    id: 'contacto', label: 'Contacto, WhatsApp y chat', icon: Mail, desc: 'Se actualiza en el pie de página, los formularios y el chat de ayuda (que deriva a WhatsApp).',
    fields: [
      { key: 'contact_email', label: 'Correo de contacto', type: 'email', def: 'contacto@bibliohub.org' },
      { key: 'contact_whatsapp', label: 'WhatsApp (solo números)', type: 'wa', def: '5493786403914', help: 'Código de país + número, sin + ni espacios. Ej: 5493786403914' },
      { key: 'contact_whatsapp_label', label: 'Texto del WhatsApp en el pie', type: 'text', def: '3786 403914 · WhatsApp', max: 60 },
      { key: 'contact_phone1', label: 'Teléfono 1', type: 'phone', def: '(+54-11) 4000-0000' },
      { key: 'contact_phone2', label: 'Teléfono 2', type: 'phone', def: '(+54-11) 4000-0002' },
      { key: 'wa_message', label: 'Mensaje inicial de WhatsApp', type: 'text', def: 'Hola BiblioHub, quisiera hacer una consulta.', max: 160, help: 'Es lo primero que se escribe cuando alguien pasa del chat a WhatsApp.' },
      { key: 'wa_label', label: 'Texto del botón del chat', type: 'text', def: 'Chatea con nosotros', max: 50, help: 'Aparece junto al botón flotante del chat.' },
      { key: 'chat_welcome', label: 'Mensaje de bienvenida del chat', type: 'textarea', def: '¡Hola! Soy el asistente de BiblioHub. Cuéntame qué necesitas o elige un tema.', max: 200 },
    ],
  },
  {
    id: 'redes', label: 'Redes sociales', icon: Share2, desc: 'Las que completes aparecen como íconos en el pie de página. Dejá vacías las que no uses.',
    fields: [
      { key: 'social_instagram', label: 'Instagram', type: 'url', def: '', help: 'https://www.instagram.com/tu-usuario' },
      { key: 'social_facebook', label: 'Facebook', type: 'url', def: '', help: 'https://www.facebook.com/tu-pagina' },
      { key: 'social_youtube', label: 'YouTube', type: 'url', def: '', help: 'https://www.youtube.com/@tu-canal' },
      { key: 'social_x', label: 'X (Twitter)', type: 'url', def: '', help: 'https://x.com/tu-usuario' },
      { key: 'social_tiktok', label: 'TikTok', type: 'url', def: '', help: 'https://www.tiktok.com/@tu-usuario' },
    ],
  },
  {
    id: 'aviso', label: 'Aviso destacado', icon: Bell, desc: 'Un cartel que aparece abajo a la izquierda (ej: cambios de horario, un evento). El visitante puede cerrarlo.',
    fields: [
      { key: 'announce_active', label: 'Mostrar el aviso', type: 'bool', def: '' },
      { key: 'announce_text', label: 'Texto del aviso', type: 'text', def: '', max: 140 },
      { key: 'announce_link', label: 'Enlace (opcional)', type: 'url', def: '', help: 'Un link https://… o una sección como #eventos' },
    ],
  },
  {
    id: 'pie', label: 'Pie de página', icon: PanelBottom, desc: 'Los textos del final de la página.',
    fields: [
      { key: 'footer_tagline', label: 'Frase del pie', type: 'text', def: 'Historias entre páginas.', max: 80 },
      { key: 'footer_lead', label: 'Descripción del pie', type: 'textarea', def: 'Libros, archivos y encuentros para toda la comunidad, siempre a mano.', max: 200 },
      { key: 'legal_text', label: 'Texto legal', type: 'text', def: '© 2026 BiblioHub. Todos los derechos reservados.', max: 120 },
    ],
  },
  {
    id: 'apariencia', label: 'Apariencia', icon: Palette, desc: 'Color de acento de los botones y detalles dorados.',
    fields: [{ key: 'color_gold', label: 'Color de acento', type: 'color', def: '#d9ab4a', help: 'Formato #RRGGBB' }],
  },
];

export const ALL_SETTING_FIELDS = SETTING_GROUPS.flatMap((g) => g.fields);
