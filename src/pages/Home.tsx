import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ApiError, generateRoute } from "../lib/api";
import {
  remainingRoutes,
  type Itinerary,
  type RouteInput,
} from "../lib/types";
import RouteForm from "../components/RouteForm";
import ItineraryView from "../components/ItineraryView";
import Paywall, { BASELINE_KEY } from "../components/Paywall";

const DRAFT_KEY = "rutavan:draft";
const DEFAULT_INPUT: RouteInput = { zona: "", dias: 3, ritmo: "tranquilo", plan: "naturaleza" };

function loadDraft(): RouteInput {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? { ...DEFAULT_INPUT, ...JSON.parse(raw) } : DEFAULT_INPUT;
  } catch {
    return DEFAULT_INPUT;
  }
}

export default function Home() {
  const { session, loading: authLoading, credits, refreshCredits } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const paid = params.get("pago") === "ok";

  const cancelled = params.get("pago") === "cancelado";
  const [payment, setPayment] = useState<"confirming" | "done" | "slow" | null>(null);

  // Tras volver de Stripe, el webhook puede tardar unos segundos en sumar créditos:
  // consultamos hasta que el saldo suba (o hasta ~40 s).
  useEffect(() => {
    if (!paid || !session) return;
    let baseline = NaN;
    try {
      baseline = Number(sessionStorage.getItem(BASELINE_KEY));
    } catch {
      // sin sessionStorage
    }
    setPayment("confirming");
    let tries = 0;
    let stopped = false;
    const check = async () => {
      const c = await refreshCredits();
      if (stopped) return;
      tries += 1;
      if (Number.isNaN(baseline) || remainingRoutes(c) > baseline) {
        setPayment("done");
        try {
          sessionStorage.removeItem(BASELINE_KEY);
        } catch {
          // sin sessionStorage
        }
      } else if (tries >= 20) {
        setPayment("slow");
      } else {
        window.setTimeout(() => void check(), 2000);
      }
    };
    void check();
    return () => {
      stopped = true;
    };
  }, [paid, session, refreshCredits]);

  const noCredits = !!session && credits !== null && remainingRoutes(credits) === 0;

  const submit = async (input: RouteInput) => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(input));
    if (!session) {
      navigate("/entrar");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { route } = await generateRoute(input);
      setItinerary(route.itinerary);
      sessionStorage.removeItem(DRAFT_KEY);
      await refreshCredits();
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      if (e instanceof ApiError && e.code === "no_credits") await refreshCredits();
      setError(e instanceof Error ? e.message : "No se pudo generar la ruta.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Tu ruta en camper, día a día
        </h1>
        <p className="mt-4 max-w-prose text-lg text-slate-700">
          Dinos la zona, los días y el tipo de plan. Te damos paradas, tiempos de conducción y
          dónde pernoctar. Tu primera ruta es gratis.
        </p>
      </section>

      {paid && payment === "confirming" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-800 shadow-card"
        >
          <Loader2 className="shrink-0 animate-spin text-emerald-700" size={22} aria-hidden />
          Confirmando tu pago… Esto puede tardar unos segundos.
        </div>
      )}
      {paid && payment === "done" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"
        >
          <CheckCircle2 className="shrink-0" size={22} aria-hidden />
          ¡Pago confirmado! Ya tienes {remainingRoutes(credits)} rutas disponibles.
          <button
            className="ml-auto font-semibold underline"
            onClick={() => setParams({}, { replace: true })}
          >
            Cerrar
          </button>
        </div>
      )}
      {paid && payment === "slow" && (
        <div
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900"
        >
          Tu pago está tardando más de lo normal en confirmarse. No tienes que pagar de nuevo:
          recarga la página en un minuto y verás tus rutas.
        </div>
      )}
      {cancelled && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-800"
        >
          Has cancelado el pago. No se ha hecho ningún cargo.
          <button
            className="ml-auto font-semibold underline"
            onClick={() => setParams({}, { replace: true })}
          >
            Cerrar
          </button>
        </div>
      )}

      {paid && payment === "confirming" ? null : noCredits ? (
        <Paywall />
      ) : (
        <RouteForm
          initial={loadDraft()}
          loading={loading}
          submitLabel={session ? "Generar mi ruta" : "Entrar para generar mi ruta"}
          onSubmit={(i) => void submit(i)}
        />
      )}

      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-800">
          {error}
        </p>
      )}

      <div ref={resultRef}>{itinerary && <ItineraryView itinerary={itinerary} />}</div>
    </div>
  );
}
