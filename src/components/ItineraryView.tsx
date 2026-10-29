import { Clock, MapPin, Moon, TriangleAlert } from "lucide-react";
import type { Itinerary } from "../lib/types";

const formatHours = (h: number) => {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  if (hh === 0) return `${mm} min`;
  return mm === 0 ? `${hh} h` : `${hh} h ${mm} min`;
};

export default function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  return (
    <section className="space-y-6" aria-label="Itinerario">
      <header>
        <h2 className="text-3xl font-extrabold">{itinerary.title}</h2>
        <p className="mt-2 max-w-prose text-lg text-slate-700">{itinerary.summary}</p>
      </header>

      <div
        role="note"
        className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-900"
      >
        <TriangleAlert className="mt-0.5 shrink-0" size={22} aria-hidden />
        <p>
          <strong>Comprueba la normativa de pernocta.</strong> Las zonas, áreas y horarios
          cambian y la IA puede equivocarse o usar datos desactualizados. Confirma en el
          ayuntamiento o en fuentes oficiales de la zona antes de dormir en cualquier sitio.
        </p>
      </div>

      <ol className="space-y-4">
        {itinerary.days.map((d) => (
          <li key={d.day} className="card p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
                {d.day}
              </span>
              <div>
                <h3 className="text-xl font-bold">{d.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-base text-slate-700">
                  <Clock size={18} aria-hidden />
                  {d.driving.from} → {d.driving.to} · {formatHours(d.driving.hours)} al volante
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {d.stops.map((s) => (
                <li key={s.name} className="flex gap-3">
                  <MapPin className="mt-1 shrink-0 text-emerald-700" size={20} aria-hidden />
                  <div>
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-base text-slate-700">{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-3 rounded-xl bg-slate-100 p-4">
              <Moon className="mt-1 shrink-0 text-slate-700" size={20} aria-hidden />
              <div>
                <p className="font-semibold text-slate-900">Pernocta: {d.overnight.name}</p>
                <p className="text-base text-slate-700">{d.overnight.notes}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
