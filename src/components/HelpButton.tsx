import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MessageCircleWarning, X } from "lucide-react";
import { sendHelpMessage } from "@/lib/live.functions";

export function HelpButton() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const send = useServerFn(sendHelpMessage);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.message.trim().length < 5) { toast.error("Cuéntanos un poco más"); return; }
    setBusy(true);
    try { await send({ data: { ...form, page: pathname } }); toast.success("Mensaje enviado al coordinador"); setForm({ name: "", contact: "", message: "" }); setOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : "No se pudo enviar"); }
    finally { setBusy(false); }
  };
  return <>
    {open && <form onSubmit={submit} className="zine-card fixed bottom-20 right-4 z-[320] w-[min(22rem,calc(100vw-2rem))] p-4" aria-label="Avisar de un fallo">
      <div className="flex items-center justify-between"><p className="zine-title text-lg">¿Algún fallo?</p><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1"><X className="h-5 w-5" /></button></div>
      <p className="mt-1 text-sm text-muted-foreground">Escribe a los coordinadores. Lo leerán en el panel.</p>
      <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} maxLength={1000} rows={4} placeholder="¿Qué ha pasado?" className="zine-input mt-3 w-full p-2" required />
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={80} placeholder="Tu nombre (opcional)" className="zine-input mt-2 w-full px-2 py-2" />
      <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} maxLength={120} placeholder="Instagram o correo (opcional)" className="zine-input mt-2 w-full px-2 py-2" />
      <button disabled={busy} className="zine-btn zine-btn-primary mt-3 min-h-10 w-full">{busy ? "Enviando…" : "Enviar"}</button>
    </form>}
    <button type="button" onClick={() => setOpen(v => !v)} className="zine-btn zine-btn-primary fixed bottom-4 right-4 z-[320] inline-flex min-h-12 items-center gap-2 px-4 text-sm" aria-expanded={open}>
      <MessageCircleWarning className="h-5 w-5" />Ayuda
    </button>
  </>;
}
