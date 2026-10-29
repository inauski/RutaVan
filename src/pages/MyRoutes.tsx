import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { SavedRoute } from "../lib/types";
import ItineraryView from "../components/ItineraryView";

export default function MyRoutes() {
  const { session, loading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<SavedRoute[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("routes")
      .select("id, input, itinerary, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRoutes((data as SavedRoute[]) ?? []));
  }, [session]);

  if (authLoading) return null;

  if (!session) {
    return (
      <p className="text-lg">
        <Link to="/entrar" className="font-semibold text-emerald-800 underline">
          Entra
        </Link>{" "}
        para ver tus rutas guardadas.
      </p>
    );
  }

  const open = routes?.find((r) => r.id === openId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Mis rutas</h1>

      {routes === null && <p className="text-lg text-slate-700">Cargando…</p>}
      {routes?.length === 0 && (
        <p className="text-lg text-slate-700">
          Todavía no tienes rutas.{" "}
          <Link to="/" className="font-semibold text-emerald-800 underline">
            Crea la primera
          </Link>
          .
        </p>
      )}

      <ul className="space-y-3">
        {routes?.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => setOpenId(openId === r.id ? null : r.id)}
              aria-expanded={openId === r.id}
              className="card w-full p-4 text-left transition hover:shadow-glow"
            >
              <p className="text-lg font-bold">{r.itinerary.title}</p>
              <p className="text-base text-slate-700">
                {r.input.zona} · {r.input.dias} {r.input.dias === 1 ? "día" : "días"} ·{" "}
                {new Date(r.created_at).toLocaleDateString("es-ES")}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {open && <ItineraryView itinerary={open.itinerary} />}
    </div>
  );
}
