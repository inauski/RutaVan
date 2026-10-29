-- Cada usuario puede borrar solo sus propias rutas
grant delete on public.routes to authenticated;
create policy "Borrar mis rutas" on public.routes
  for delete to authenticated using ((select auth.uid()) = user_id);
