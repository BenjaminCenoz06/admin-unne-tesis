'use client';

import { useActionState } from 'react';
import { BookMarked, Loader2, LogIn } from 'lucide-react';
import { login, type LoginState } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <BookMarked className="h-7 w-7 text-gold" aria-hidden />
          <span className="text-xl font-semibold tracking-tight">BiblioHub · Administración</span>
        </div>
        <form action={action} className="card space-y-4 p-6" noValidate>
          <div>
            <h1 className="text-lg font-semibold">Iniciar sesión</h1>
            <p className="text-sm text-slate-500">Acceso solo para el equipo autorizado.</p>
          </div>
          <div>
            <label htmlFor="email" className="label">Correo</label>
            <input id="email" name="email" type="email" autoComplete="username" required className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
          </div>
          {state.error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn className="h-4 w-4" aria-hidden />}
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
