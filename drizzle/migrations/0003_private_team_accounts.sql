create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique,
 created_at timestamptz not null default now(),
 constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,32}$')
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create or replace function public.handle_first_owner() returns trigger language plpgsql security definer set search_path = public as $$ begin return new; end $$;
comment on function public.handle_first_owner() is 'Automatic owner assignment disabled: only explicit trusted provisioning may assign admin.';
create or replace function public.handle_team_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
 if new.email like '%@team.discopatio.invalid' then
  insert into public.profiles (id, username) values (new.id, split_part(new.email, '@', 1));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
 end if;
 return new;
end $$;
create trigger on_auth_user_created_team_profile after insert on auth.users for each row execute function public.handle_team_profile();