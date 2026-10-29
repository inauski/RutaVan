import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { createCheckout } from "../lib/api";
import { PACK_PRICE, PACK_ROUTES } from "../lib/types";

export default function Paywall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    setLoading(true);
    setError(null);
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
        Comprar pack de {PACK_ROUTES} rutas · {PACK_PRICE}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-base text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
