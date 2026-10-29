# RutaVan

Planificador de rutas en camper con IA. 1 ruta gratis y un pack de 5 rutas por 4,99 € (pago único con Stripe).

**Stack:** React + Vite + TypeScript + Tailwind · Supabase (auth, BD, Edge Functions) · Claude (Anthropic) · Stripe Checkout.

## Arranque local

```bash
npm install
npm run dev
```

El `.env` ya apunta al proyecto Supabase `camper_rutavan`.

## Ya hecho en Supabase (`camper_rutavan`)

- Migración `supabase/migrations/20261028000000_init.sql` aplicada (tablas `user_credits`, `routes`, `stripe_events`, RLS y funciones de créditos).
- Edge Functions desplegadas: `generate-route`, `create-checkout`, `stripe-webhook`.

## Pendiente: secretos (Dashboard → Edge Functions → Secrets)

| Secreto | Valor |
| --- | --- |
| `ANTHROPIC_API_KEY` | Tu clave de Anthropic |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PRICE_ID` | `price_...` del producto "Pack 5 rutas" (4,99 €, pago único) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del endpoint de webhook (ver abajo) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://tu-dominio` |

## Webhook de Stripe

Endpoint: `https://cfaxhqpduyghhgyukcnd.supabase.co/functions/v1/stripe-webhook`, evento `checkout.session.completed`.

## Probar el pago

Tarjeta de test `4242 4242 4242 4242`, cualquier fecha futura y CVC.

## Notas

- Cada resultado muestra un aviso para comprobar la normativa de pernocta.
- Si Supabase exige confirmar el correo, el registro pedirá confirmarlo antes de entrar.
