import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setError(error.message);
      else if (!data.session) setInfo("Te hemos enviado un correo. Confírmalo y vuelve a entrar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-extrabold">
        {mode === "signup" ? "Crea tu cuenta" : "Entra en tu cuenta"}
      </h1>

      <form onSubmit={(e) => void submit(e)} className="card space-y-6 p-6">
        <div>
          <label htmlFor="email" className="label">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Contraseña (mínimo 6 caracteres)
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="field"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-base text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-base text-emerald-800">
            {info}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" size={20} aria-hidden />}
          {mode === "signup" ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <p className="text-center text-base text-slate-700">
        {mode === "signup" ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <button
          className="font-semibold text-emerald-800 underline"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signup" ? "Entrar" : "Crear cuenta"}
        </button>
      </p>
    </div>
  );
}
