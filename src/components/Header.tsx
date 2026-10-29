import { Link } from "react-router-dom";
import { Caravan, LogOut, Ticket } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { remainingRoutes } from "../lib/types";

export default function Header() {
  const { session, credits, signOut } = useAuth();
  const left = remainingRoutes(credits);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white">
            <Caravan size={22} aria-hidden />
          </span>
          RutaVan
        </Link>

        <nav className="flex items-center gap-2">
          {session ? (
            <>
              <span
                className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-base font-medium text-emerald-800 sm:inline-flex"
                title="Rutas disponibles"
              >
                <Ticket size={18} aria-hidden />
                {left} {left === 1 ? "ruta" : "rutas"}
              </span>
              <Link to="/mis-rutas" className="btn-secondary !min-h-[44px] !px-4">
                Mis rutas
              </Link>
              <button
                onClick={() => void signOut()}
                className="btn-secondary !min-h-[44px] !px-3"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} aria-hidden />
              </button>
            </>
          ) : (
            <Link to="/entrar" className="btn-secondary !min-h-[44px] !px-4">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
