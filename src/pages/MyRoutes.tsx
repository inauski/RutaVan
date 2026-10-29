import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { SavedRoute } from "../lib/types";
import ItineraryView from "../components/ItineraryView";

export default function MyRoutes() {
  const { session, loading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<SavedRoute[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("routes")
      .select("id, input, itinerary, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRoutes((data as SavedRoute[]) ?? []));
  }, [session]);

  const remove = async (id: string) => {
    setDeletingId(id);
    setError(null);
    const { error: err } = await supabase.from("routes").delete().eq("id", id);
    setDeletingId(null);
    if (err) {
      setError("No se pudo eliminar la ruta. Inténtalo de nuevo.");
      return;
    }
    setRoutes((prev) => prev?.filter((r) => r.id !== id) ?? null);
    if (openId === id) setOpenId(null);
    setConfirmId(null);
  };

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

      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-800">
          {error}
        </p>
      )}

      <ul className="space-y-4">
        {routes?.map((r) => {
          const isOpen = openId === r.id;
          return (
            <li key={r.id} className="card p-4 sm:p-6">
              <div>
                <p className="text-lg font-bold">{r.itinerary.title}</p>
                <p className="text-base text-slate-700">
                  {r.input.zona} · {r.input.dias} {r.input.dias === 1 ? "día" : "días"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>

              {confirmId === r.id ? (
                <div
                  role="alertdialog"
                  aria-label="Confirmar eliminación"
                  className="mt-4 rounded-xl bg-red-50 p-4"
                >
                  <p className="text-base font-medium text-red-900">
                    ¿Eliminar esta ruta? No se puede deshacer y no se devuelve la ruta gastada.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => void remove(r.id)}
                      disabled={deletingId === r.id}
                      className="btn !min-h-[44px] bg-red-700 !px-4 text-white hover:bg-red-800"
                    >
                      {deletingId === r.id && <Loader2 className="animate-spin" size={18} aria-hidden />}
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      disabled={deletingId === r.id}
                      className="btn-secondary !min-h-[44px] !px-4"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                    aria-expanded={isOpen}
                    className="btn-secondary !min-h-[44px] !px-4"
                  >
                    {isOpen ? (
                      <ChevronUp size={18} aria-hidden />
                    ) : (
                      <ChevronDown size={18} aria-hidden />
                    )}
                    {isOpen ? "Ocultar ruta" : "Ver ruta"}
                  </button>
                  <button
                    onClick={() => setConfirmId(r.id)}
                    className="btn-secondary !min-h-[44px] !px-4 !text-red-700"
                  >
                    <Trash2 size={18} aria-hidden />
                    Eliminar
                  </button>
                </div>
              )}

              {isOpen && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <ItineraryView itinerary={r.itinerary} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
