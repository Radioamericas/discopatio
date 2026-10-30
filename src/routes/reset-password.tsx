import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Restablecer contraseña · DiscoPatio" },
    { name: "description", content: "Recuperación privada de la cuenta propietaria de DiscoPatio." },
    { property: "og:title", content: "Restablecer contraseña · DiscoPatio" },
    { property: "og:description", content: "Recuperación de acceso a Radio Patio Las Américas." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const recovery = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    const check = () => {
      if (!recovery && window.sessionStorage.getItem("discopatio-recovery") !== "true") return;
      supabase.auth.getUser().then(({ data, error }) => setReady(!error && Boolean(data.user)));
    };
    check();
    window.addEventListener("discopatio-recovery", check);
    return () => window.removeEventListener("discopatio-recovery", check);
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || password !== confirmation) { toast.error("Las contraseñas no coinciden."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error("No se pudo actualizar la contraseña", { description: error.message });
    else { window.sessionStorage.removeItem("discopatio-recovery"); setDone(true); toast.success("Contraseña actualizada"); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground"><div className="w-full max-w-sm space-y-5"><h1 className="text-2xl font-semibold">Restablecer contraseña</h1>{done ? <p>Contraseña actualizada.</p> : ready ? <form className="space-y-3" onSubmit={submit}><Input required minLength={8} type="password" autoComplete="new-password" aria-label="Nueva contraseña" placeholder="Nueva contraseña" value={password} onChange={e => setPassword(e.target.value)} /><Input required minLength={8} type="password" autoComplete="new-password" aria-label="Repetir contraseña" placeholder="Repetir contraseña" value={confirmation} onChange={e => setConfirmation(e.target.value)} /><Button disabled={busy} className="w-full">Guardar contraseña</Button></form> : <p className="text-muted-foreground">Abre el enlace de recuperación enviado a tu correo. Si ha caducado, solicita otro desde el acceso privado.</p>}<Link to="/admin" className="block text-primary underline">Volver al acceso privado</Link></div></main>;
}