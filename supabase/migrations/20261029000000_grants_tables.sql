-- El navegador (authenticated) solo lee; RLS limita a las filas propias
grant select on public.user_credits to authenticated;
grant select on public.routes to authenticated;

-- El backend (Edge Functions) escribe
grant select, insert, update on public.user_credits to service_role;
grant select, insert on public.routes to service_role;
grant select, insert on public.stripe_events to service_role;
