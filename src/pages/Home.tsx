import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ApiError, generateRoute } from "../lib/api";
import {
  remainingRoutes,
  type Itinerary,
  type RouteInput,
} from "../lib/types";
import RouteForm from "../components/RouteForm";
import ItineraryView from "../components/ItineraryView";
import Paywall from "../components/Paywall";

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

  // Tras volver de Stripe, el webhook puede tardar unos segundos en sumar créditos.
  useEffect(() => {
    if (!paid || !session) return;
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      void refreshCredits();
      if (tries >= 8) window.clearInterval(id);
    }, 2000);
    return () => window.clearInterval(id);
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

      {paid && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-900"
        >
          <CheckCircle2 size={22} aria-hidden />
          Pago recibido. En unos segundos verás tus 5 rutas nuevas.
          <button
            className="ml-auto font-semibold underline"
            onClick={() => setParams({}, { replace: true })}
          >
            Cerrar
          </button>
        </div>
      )}

      {noCredits ? (
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
