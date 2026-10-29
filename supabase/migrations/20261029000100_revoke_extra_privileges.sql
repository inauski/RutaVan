-- Los privilegios por defecto de Supabase dan TRUNCATE (que se salta RLS) a anon/authenticated
revoke truncate, references, trigger on public.user_credits, public.routes, public.stripe_events from anon, authenticated;
