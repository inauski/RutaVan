-- Créditos por usuario: 1 ruta gratis (free_used) + rutas de pago (paid_credits)
create table public.user_credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  free_used int not null default 0 check (free_used >= 0),
  paid_credits int not null default 0 check (paid_credits >= 0),
  updated_at timestamptz not null default now()
);
alter table public.user_credits enable row level security;
create policy "Ver mis créditos" on public.user_credits
  for select to authenticated using ((select auth.uid()) = user_id);

-- Rutas guardadas (solo las inserta la Edge Function con service_role)
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  input jsonb not null,
  itinerary jsonb not null,
  created_at timestamptz not null default now()
);
create index routes_user_created_idx on public.routes (user_id, created_at desc);
alter table public.routes enable row level security;
create policy "Ver mis rutas" on public.routes
  for select to authenticated using ((select auth.uid()) = user_id);

-- Eventos de Stripe ya procesados (idempotencia del webhook). Sin políticas: solo service_role.
create table public.stripe_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- Fila de créditos al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_credits (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Consume un crédito de forma atómica. Devuelve 'free' o 'paid'; lanza 'no_credits' si no hay.
create function public.consume_route_credit(p_user uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  kind text;
begin
  update public.user_credits
     set free_used = free_used + 1, updated_at = now()
   where user_id = p_user and free_used < 1
   returning 'free' into kind;
  if kind is not null then return kind; end if;

  update public.user_credits
     set paid_credits = paid_credits - 1, updated_at = now()
   where user_id = p_user and paid_credits > 0
   returning 'paid' into kind;
  if kind is not null then return kind; end if;

  raise exception 'no_credits';
end;
$$;

-- Devuelve el crédito si la generación falla
create function public.refund_route_credit(p_user uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind = 'free' then
    update public.user_credits
       set free_used = greatest(free_used - 1, 0), updated_at = now()
     where user_id = p_user;
  else
    update public.user_credits
       set paid_credits = paid_credits + 1, updated_at = now()
     where user_id = p_user;
  end if;
end;
$$;

-- Suma créditos tras un pago; idempotente por event_id. Devuelve false si el evento ya se procesó.
create function public.add_paid_credits(p_user uuid, p_amount int, p_event text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.stripe_events (event_id) values (p_event)
  on conflict do nothing;
  if not found then return false; end if;

  update public.user_credits
     set paid_credits = paid_credits + p_amount, updated_at = now()
   where user_id = p_user;
  return true;
end;
$$;

-- Estas funciones solo las puede llamar el backend (service_role), nunca el navegador
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.consume_route_credit(uuid) from public, anon, authenticated;
revoke execute on function public.refund_route_credit(uuid, text) from public, anon, authenticated;
revoke execute on function public.add_paid_credits(uuid, int, text) from public, anon, authenticated;
grant execute on function public.consume_route_credit(uuid) to service_role;
grant execute on function public.refund_route_credit(uuid, text) to service_role;
grant execute on function public.add_paid_credits(uuid, int, text) to service_role;
