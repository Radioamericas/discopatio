create or replace function public.reject_public_registration() returns trigger language plpgsql security definer set search_path = public as $$
begin
 if coalesce(new.raw_app_meta_data ->> 'provisioned_by_owner', '') <> 'true' then
  raise exception 'El registro público está cerrado. Solo el propietario puede crear cuentas.';
 end if;
 return new;
end $$;
create trigger reject_public_registration before insert on auth.users for each row execute function public.reject_public_registration();
revoke update on public.profiles from authenticated;
comment on table public.profiles is 'Team usernames are immutable credentials; only owner-created accounts, server-managed.';