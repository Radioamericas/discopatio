import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { teamEmail } from "@/lib/team-accounts";
import { ownerCreateUser, ownerListUsers, ownerResetUserPassword } from "@/lib/team-accounts.functions";

export function AccountSignIn({ onDone }: { onDone: () => void }) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (forgot) {
        if (!identity.includes("@")) {
          toast.info("Contacta con el administrador", { description: "Las cuentas sin correo solo pueden recuperar la contraseña a través del administrador." });
          return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(identity.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Revisa tu correo", { description: "Si existe la cuenta, recibirás un enlace para restablecer la contraseña." });
      } else {
        const email = identity.includes("@") ? identity.trim() : teamEmail(identity);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Nombre, correo o contraseña incorrectos.");
        toast.success("Sesión iniciada");
        onDone();
      }
    } catch (error) { toast.error("No se pudo acceder", { description: error instanceof Error ? error.message : "Inténtalo de nuevo." }); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-3 text-left">
    <Input required aria-label="Usuario o correo del propietario" value={identity} onChange={e => setIdentity(e.target.value)} autoComplete="username" placeholder="Usuario o correo del propietario" />
    {!forgot && <Input required minLength={8} aria-label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Contraseña" />}
    <Button disabled={busy} type="submit" className="h-12 w-full">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{forgot ? "Recuperar contraseña" : "Entrar con cuenta"}</Button>
    <Button type="button" variant="link" className="w-full text-xs" onClick={() => setForgot(v => !v)}>{forgot ? "Volver a iniciar sesión" : "Olvidé contraseña"}</Button>
  </form>;
}

export function OwnerUsers() {
  const qc = useQueryClient();
  const list = useServerFn(ownerListUsers);
  const create = useServerFn(ownerCreateUser);
  const reset = useServerFn(ownerResetUserPassword);
  const users = useQuery({ queryKey: ["owner", "users"], queryFn: () => list(), retry: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const creation = useMutation({ mutationFn: () => create({ data: { username, password } }), onSuccess: () => { setUsername(""); setPassword(""); qc.invalidateQueries({ queryKey: ["owner", "users"] }); toast.success("Usuario creado"); }, onError: (e: Error) => toast.error(e.message) });
  const recovery = useMutation({ mutationFn: (id: string) => reset({ data: { id, password: newPassword } }), onSuccess: () => { setTarget(null); setNewPassword(""); toast.success("Contraseña restablecida"); }, onError: (e: Error) => toast.error(e.message) });
  return <section className="mt-5 border-t border-border py-5 text-foreground">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><UserPlus className="h-5 w-5 text-primary" />Usuarios del equipo</h2>
    <form onSubmit={e => { e.preventDefault(); creation.mutate(); }} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <Input required aria-label="Nuevo nombre de usuario" placeholder="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" />
      <Input required minLength={8} type="password" aria-label="Contraseña inicial" placeholder="Contraseña inicial" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
      <Button type="submit" disabled={creation.isPending}><UserPlus className="mr-2 h-4 w-4" />Crear usuario</Button>
    </form>
    {users.isError && <p className="mt-3 text-destructive">No se pudieron cargar los usuarios.</p>}
    <div className="mt-4 divide-y divide-border">{users.data?.map(user => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="font-mono">{user.username}</span>
      {target === user.id ? <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); recovery.mutate(user.id); }}><Input required minLength={8} type="password" aria-label={`Nueva contraseña de ${user.username}`} placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" /><Button type="submit" disabled={recovery.isPending}>Guardar contraseña</Button><Button type="button" variant="ghost" onClick={() => { setTarget(null); setNewPassword(""); }}>Cancelar</Button></form> : <Button variant="outline" onClick={() => { setTarget(user.id); setNewPassword(""); }}><KeyRound className="mr-2 h-4 w-4" />Restablecer contraseña</Button>}
    </div>)}</div>
  </section>;
}