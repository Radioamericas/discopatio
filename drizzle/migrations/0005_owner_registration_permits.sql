create table public.account_creation_permits (email text primary key, expires_at timestamptz not null default now() + interval '2 minutes');
grant all on public.account_creation_permits to service_role;
alter table public.account_creation_permits enable row level security;
create or replace function public.reject_public_registration() returns trigger language plpgsql security definer set search_path = public as $$
declare permitted text;
begin
 delete from public.account_creation_permits where email = new.email and expires_at > now() returning email into permitted;
 if permitted is null then raise exception 'El registro público está cerrado. Solo el propietario puede crear cuentas.'; end if;
 return new;
end $$;