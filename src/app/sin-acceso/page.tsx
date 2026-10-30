import { ShieldAlert } from 'lucide-react';
import { logout } from '../login/actions';

export default function SinAcceso() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md space-y-4 p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
        <h1 className="text-lg font-semibold">Tu cuenta todavía no tiene acceso al panel</h1>
        <p className="text-sm text-slate-500">
          Iniciaste sesión, pero tu rol no permite administrar contenido. Pedile a un administrador que te asigne un rol de Editor o superior.
        </p>
        <form action={logout}>
          <button className="btn btn-ghost" type="submit">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}
