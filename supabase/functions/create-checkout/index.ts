import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json, siteOrigin } from "../_shared/http.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Método no permitido" }, 405);

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "Inicia sesión para comprar." }, 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json(req, { error: "Sesión no válida." }, 401);

  const origin = siteOrigin(req);
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": Deno.env.get("STRIPE_PRICE_ID")!,
    "line_items[0][quantity]": "1",
    client_reference_id: data.user.id,
    success_url: `${origin}/?pago=ok`,
    cancel_url: `${origin}/?pago=cancelado`,
  });
  if (data.user.email) form.set("customer_email", data.user.email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")!}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const session = await res.json();
  if (!res.ok || !session.url) {
    console.error("create-checkout", session);
    return json(req, { error: "No se pudo iniciar el pago." }, 502);
  }
  return json(req, { url: session.url });
});
