'use client';

import type { ReactNode } from 'react';

/** Botón de formulario que pide confirmación antes de ejecutar una acción del servidor. */
export default function ConfirmButton({
  action, message, className, children,
}: { action: () => Promise<void>; message: string; className?: string; children: ReactNode }) {
  return (
    <form action={action} onSubmit={(ev) => { if (!window.confirm(message)) ev.preventDefault(); }}>
      <button type="submit" className={className}>{children}</button>
    </form>
  );
}
