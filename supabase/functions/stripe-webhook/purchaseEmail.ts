const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface PurchaseEmailInput {
  to: string;
  amountTotal: number | null; // en céntimos
  currency: string | null;
  routesAdded: number;
  routesAvailable: number | null;
  eventId: string;
}

function siteUrl(): string | null {
  const explicit = Deno.env.get("SITE_URL")?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const fromOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .find((s) => s.startsWith("https://"));
  return fromOrigins ?? null;
}

function formatAmount(cents: number | null, currency: string | null): string | null {
  if (cents == null || !currency) return null;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
}

function buildEmail(i: PurchaseEmailInput) {
  const amount = formatAmount(i.amountTotal, i.currency);
  const date = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
  const url = siteUrl();
  const support = Deno.env.get("SUPPORT_EMAIL")?.trim() || null;

  const rows: [string, string][] = [["Producto", `Pack de ${i.routesAdded} rutas`]];
  if (amount) rows.push(["Importe", amount]);
  rows.push(["Fecha", date]);
  if (i.routesAvailable != null) rows.push(["Rutas disponibles ahora", String(i.routesAvailable)]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#475569;font-size:16px">${esc(k)}</td>` +
        `<td style="padding:8px 0;text-align:right;color:#0f172a;font-size:16px;font-weight:600">${esc(v)}</td></tr>`,
    )
    .join("");

  const button = url
    ? `<p style="margin:32px 0"><a href="${esc(url)}" style="display:inline-block;background:#047857;color:#ffffff;` +
      `text-decoration:none;font-weight:600;font-size:16px;padding:14px 24px;border-radius:12px">Crear mi próxima ruta</a></p>`
    : "";

  const supportHtml = support
    ? `<p style="margin:0 0 8px;color:#475569;font-size:16px">¿Dudas o algún problema con tu compra? Escríbenos a ` +
      `<a href="mailto:${esc(support)}" style="color:#047857">${esc(support)}</a>.</p>`
    : "";

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
    <p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#047857">RutaVan</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a">¡Gracias por tu compra!</h1>
    <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:1.5">
      Tu pago se ha recibido correctamente y tus rutas ya están en tu cuenta. ¡Disfruta del viaje!
    </p>
    <table role="presentation" width="100%" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-collapse:collapse">${rowsHtml}</table>
    ${button}
    <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.5">
      Recuerda que las rutas las genera una IA y pueden contener errores: comprueba siempre la normativa de pernocta de cada zona.
    </p>
    ${supportHtml}
  </div>
</div></body></html>`;

  const text = [
    "¡Gracias por tu compra en RutaVan!",
    "",
    "Tu pago se ha recibido correctamente y tus rutas ya están en tu cuenta.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    url ? `Crea tu próxima ruta: ${url}` : "",
    "Recuerda comprobar siempre la normativa de pernocta de cada zona.",
    support ? `Contacto: ${support}` : "",
  ]
    .filter((l, idx, arr) => l !== "" || arr[idx - 1] !== "")
    .join("\n");

  return { html, text };
}

/** Envía el correo de agradecimiento. Nunca lanza: un fallo de correo no debe romper el webhook. */
export async function sendPurchaseEmail(input: PurchaseEmailInput): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada: no se envía el correo de compra");
    return;
  }
  const from = Deno.env.get("RESEND_FROM")?.trim() || "RutaVan <onboarding@resend.dev>";
  const { html, text } = buildEmail(input);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `purchase-${input.eventId}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: "¡Gracias por tu compra en RutaVan!",
        html,
        text,
      }),
    });
    if (!res.ok) console.error("resend", res.status, await res.text());
  } catch (e) {
    console.error("resend fetch", e);
  }
}
