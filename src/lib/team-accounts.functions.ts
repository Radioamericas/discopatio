import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountPassword, usernameInput, teamEmail, requireAccountOwner } from "./team-accounts";

export const ownerListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: owner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireAccountOwner(owner === true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("profiles").select("id, username, created_at").order("created_at", { ascending: false });
    if (error) throw new Error("No se pudieron cargar los usuarios.");
    return data ?? [];
  });

export const ownerCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string; password: string }) => z.object({ username: usernameInput, password: accountPassword }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: owner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireAccountOwner(owner === true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.auth.admin.createUser({
      email: teamEmail(data.username), password: data.password, email_confirm: true,
      app_metadata: { provisioned_by_owner: true },
    });
    if (error || !result.user) throw new Error("No se pudo crear la cuenta. Comprueba que el nombre no esté ocupado y usa una contraseña segura.");
    return { username: data.username };
  });

export const ownerResetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; password: string }) => z.object({ id: z.string().uuid(), password: accountPassword }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: owner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireAccountOwner(owner === true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin.from("profiles").select("username").eq("id", data.id).maybeSingle();
    if (!profile) throw new Error("Esta cuenta no pertenece al equipo.");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
    if (error) throw new Error("No se pudo restablecer la contraseña. Usa una contraseña segura.");
    return { success: true };
  });