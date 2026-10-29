import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PACE_OPTIONS, PLAN_OPTIONS, type RouteInput } from "../lib/types";

interface Props {
  initial: RouteInput;
  loading: boolean;
  submitLabel: string;
  onSubmit: (input: RouteInput) => void;
}

export default function RouteForm({ initial, loading, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<RouteInput>(initial);

  const handle = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ ...values, zona: values.zona.trim() });
  };

  return (
    <form onSubmit={handle} className="card space-y-6 p-6 sm:p-8">
      <div>
        <label htmlFor="zona" className="label">
          ¿Qué zona quieres recorrer?
        </label>
        <input
          id="zona"
          className="field"
          placeholder="Ej: Asturias, Pirineos…"
          value={values.zona}
          onChange={(e) => setValues({ ...values, zona: e.target.value })}
          minLength={2}
          maxLength={80}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="dias" className="label">
            Número de días (1-10)
          </label>
          <input
            id="dias"
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            className="field"
            value={values.dias}
            onChange={(e) =>
              setValues({ ...values, dias: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })
            }
            required
          />
        </div>

        <fieldset>
          <legend className="label">Ritmo</legend>
          <div className="grid grid-cols-2 gap-2">
            {PACE_OPTIONS.map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="ritmo"
                  value={o.value}
                  checked={values.ritmo === o.value}
                  onChange={() => setValues({ ...values, ritmo: o.value })}
                  className="peer sr-only"
                />
                <span className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white text-base font-medium text-slate-800 transition peer-checked:border-emerald-700 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-700/40">
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset>
        <legend className="label">Tipo de plan</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLAN_OPTIONS.map((o) => (
            <label key={o.value} className="cursor-pointer">
              <input
                type="radio"
                name="plan"
                value={o.value}
                checked={values.plan === o.value}
                onChange={() => setValues({ ...values, plan: o.value })}
                className="peer sr-only"
              />
              <span className="flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white text-base font-medium text-slate-800 transition peer-checked:border-emerald-700 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-700/40">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} aria-hidden /> Preparando tu ruta…
          </>
        ) : (
          <>
            <Sparkles size={20} aria-hidden /> {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
