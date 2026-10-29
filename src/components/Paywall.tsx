import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { createCheckout } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { PACK_PRICE, PACK_ROUTES, remainingRoutes } from "../lib/types";

export const BASELINE_KEY = "rutavan:baseline";

export default function Paywall() {
  const { credits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    setLoading(true);
    setError(null);
    try {
      // Recordamos cuántas rutas había para saber cuándo el webhook ha sumado las nuevas
      sessionStorage.setItem(BASELINE_KEY, String(remainingRoutes(credits)));
    } catch {
      // sin sessionStorage: se mostrará la confirmación genérica
    }
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar el pago.");
      setLoading(false);
    }
  };

  return (
    <div className="card border-emerald-200 p-6 text-center sm:p-8">
      <h2 className="text-2xl font-extrabold">Has usado tu ruta gratis</h2>
      <p className="mx-auto mt-2 max-w-md text-lg text-slate-700">
        Consigue {PACK_ROUTES} rutas más con un único pago de {PACK_PRICE}. Sin suscripción.
      </p>
      <button onClick={() => void buy()} disabled={loading} className="btn-primary mt-6 w-full sm:w-auto">
        {loading ? (
          <Loader2 className="animate-spin" size={20} aria-hidden />
        ) : (
          <ShoppingCart size={20} aria-hidden />
        )}
        {loading ? "Preparando el pago…" : `Comprar pack de ${PACK_ROUTES} rutas · ${PACK_PRICE}`}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-base text-red-700">
          {error}
        </p>
      )}

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-20 grid place-items-center bg-white/90 px-6 text-center backdrop-blur-sm"
        >
          <div className="space-y-4">
            <Loader2 className="mx-auto animate-spin text-emerald-700" size={48} aria-hidden />
            <p className="text-xl font-bold text-slate-900">Te llevamos al pago seguro</p>
            <p className="text-base text-slate-700">
              Puede tardar unos segundos. No cierres ni recargues la página.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
