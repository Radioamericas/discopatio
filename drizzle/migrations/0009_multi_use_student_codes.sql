ALTER TABLE public.student_access_codes ADD COLUMN IF NOT EXISTS uses_left integer NOT NULL DEFAULT 1;
create or replace function public.redeem_student_access_code(_code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int; begin
  update public.student_access_codes
    set uses_left = uses_left - 1,
        used_at = case when uses_left - 1 <= 0 then now() else used_at end
    where code = _code and used_at is null and uses_left > 0;
  get diagnostics n = row_count; return n > 0; end $$;
revoke execute on function public.redeem_student_access_code(text) from public, anon, authenticated;
grant execute on function public.redeem_student_access_code(text) to service_role;