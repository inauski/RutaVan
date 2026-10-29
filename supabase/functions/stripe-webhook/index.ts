import { createClient } from "npm:@supabase/supabase-js@2";

const PACK_ROUTES = 5;
const TOLERANCE_SECONDS = 300;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function validSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=") as [string, string]),
  );
  const t = Number(parts.t);
  const v1 = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || v1.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - t) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)));
  return v1.some((sig) => sig.length === expected.length && sig === expected);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  if (!(await validSignature(payload, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload);
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId: string | undefined = s.client_reference_id;
    if (s.payment_status === "paid" && userId) {
      const { error } = await admin.rpc("add_paid_credits", {
        p_user: userId,
        p_amount: PACK_ROUTES,
        p_event: event.id,
      });
      if (error) {
        console.error("add_paid_credits", error);
        return new Response("DB error", { status: 500 }); // Stripe reintentará
      }
    }
  }
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
