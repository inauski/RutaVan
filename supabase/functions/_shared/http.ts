// ALLOWED_ORIGINS: lista separada por comas. Admite un `*` por entrada para URLs de vista previa,
// por ejemplo https://ruta-*-miequipo.vercel.app (el `*` solo casa letras y números, sin guiones).
const entries = (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const exact = entries.filter((e) => !e.includes("*"));
const patterns = entries
  .filter((e) => e.includes("*"))
  .map(
    (e) =>
      new RegExp(
        "^" + e.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[a-z0-9]+") + "$",
      ),
  );
const fallback = exact[0] ?? "http://localhost:5173";

function isAllowed(origin: string): boolean {
  return exact.includes(origin) || patterns.some((re) => re.test(origin));
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": isAllowed(origin) ? origin : fallback,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

/** Origen permitido para las URLs de retorno de Stripe */
export function siteOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  return isAllowed(origin) ? origin : fallback;
}
