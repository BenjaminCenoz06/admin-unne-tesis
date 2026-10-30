'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookMarked, ExternalLink, LayoutDashboard, LogOut, Menu, ScrollText, UserCog, X } from 'lucide-react';
import { ENTITIES } from '@/lib/entities';
import { logout } from '@/app/login/actions';

type Props = { name: string; email: string; roleLabel: string; isAdmin: boolean; children: React.ReactNode };

export default function Shell({ name, email, roleLabel, isAdmin, children }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const item = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>) => {
    const active = path === href || path.startsWith(href + '/');
    return (
      <Link
        key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-white/15 font-medium text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        <Icon className="h-4 w-4 shrink-0" />{label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-semibold"><BookMarked className="h-5 w-5 text-brand-600" aria-hidden />BiblioHub</span>
        <button onClick={() => setOpen((v) => !v)} className="btn btn-ghost btn-sm" aria-label="Abrir menú" aria-expanded={open}>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 p-4 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center gap-2 px-2 pt-1 text-white">
          <BookMarked className="h-6 w-6 text-gold" aria-hidden />
          <span className="font-semibold tracking-tight">BiblioHub</span>
          <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/70">admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Principal">
          {item('/dashboard', 'Panel', LayoutDashboard)}
          <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Contenido</p>
          {ENTITIES.map((e) => item(`/c/${e.key}`, e.label, e.icon))}
          {isAdmin && (
            <>
              <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Administración</p>
              {item('/usuarios', 'Usuarios y roles', UserCog)}
              {item('/auditoria', 'Auditoría', ScrollText)}
            </>
          )}
        </nav>
        <a href="https://unne-tesis.vercel.app" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-4 w-4" />Ver el sitio
        </a>
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="truncate px-2 text-sm font-medium text-white">{name}</p>
          <p className="truncate px-2 text-xs text-white/60">{email} · {roleLabel}</p>
          <form action={logout} className="mt-2">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" />Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {open && <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
