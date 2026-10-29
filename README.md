# RutaVan

Planificador de rutas en camper con IA. Indicas zona, días, ritmo y tipo de plan, y recibes un itinerario día a día con paradas, tiempos de conducción y zona de pernocta.

**Demo:** https://ruta-van.vercel.app

## Funcionalidades

- Itinerario generado por IA (Claude) con aviso sobre la normativa de pernocta.
- Cuentas de usuario y rutas guardadas.
- 1 ruta gratis; después, pack de 5 rutas por 4,99 € (pago único con Stripe).
- Correo de agradecimiento tras la compra, enviado con Resend.
- Modo simulado de IA para probar sin coste.

## Tecnologías

React, Vite, TypeScript, Tailwind CSS · Supabase (auth, base de datos y Edge Functions) · Claude API · Stripe Checkout · Vercel

## Instalación

```bash
npm install
cp .env.example .env   # rellena tus claves de Supabase
npm run dev
```

La web queda en `http://localhost:5173`.

## Estructura

```
src/                  Aplicación React
supabase/migrations/  Esquema de la base de datos
supabase/functions/   Edge Functions: generate-route, create-checkout, stripe-webhook
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run preview` | Previsualizar la compilación |
