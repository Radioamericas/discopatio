import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Check, Copy, LifeBuoy, Link2, Radio, Search, X } from "lucide-react";
import { closeLiveSession, createLiveSession, listArchive, listHelpMessages, listLiveSessions, resolveHelpMessage } from "@/lib/live.functions";

const box = "zine-card mt-5 p-4 sm:p-5";
const btn = "zine-btn inline-flex min-h-10 items-center gap-2 px-4 text-sm";

export function TeamTools({ isOwner }: { isOwner: boolean }) {
  return <>
    <LiveLinks />
    <ArchivePanel />
    {isOwner && <HelpInbox />}
  </>;
}

function LiveLinks() {
  const qc = useQueryClient();
  const list = useServerFn(listLiveSessions), create = useServerFn(createLiveSession), close = useServerFn(closeLiveSession);
  const sessions = useQuery({ queryKey: ["live", "sessions"], queryFn: () => list() });
  const [title, setTitle] = useState(() => `Jueves ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`);
  const share = (code: string) => `${window.location.origin}/s/${code}`;
  const copy = async (code: string) => { await navigator.clipboard.writeText(share(code)); toast.success("Enlace copiado"); };
  const createM = useMutation({ mutationFn: () => create({ data: { title } }), onSuccess: async ({ code }) => { await qc.invalidateQueries({ queryKey: ["live"] }); copy(code).catch(() => {}); toast.success("Sesión creada", { description: share(code) }); }, onError: (e: Error) => toast.error(e.message) });
  const closeM = useMutation({ mutationFn: (code: string) => close({ data: { code } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["live"] }) });
  return <section className={box}>
    <div className="flex items-start gap-3"><Radio className="mt-1 h-5 w-5 shrink-0" /><div><h2 className="zine-title text-xl">Sesión en directo</h2><p className="mt-1 text-sm text-muted-foreground">Crea un enlace y mándalo al equipo. Quien lo abra puede marcar cada canción como «Este jueves», «Próxima» o «No va». Caduca a las 12 horas.</p></div></div>
    <form onSubmit={e => { e.preventDefault(); createM.mutate(); }} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} className="zine-input min-h-10 flex-1 px-3" aria-label="Nombre de la sesión" />
      <button className={`${btn} zine-btn-primary`} disabled={createM.isPending}><Link2 className="h-4 w-4" />Crear enlace</button>
    </form>
    <ul className="mt-4 space-y-2">
      {(sessions.data ?? []).map(s => <li key={s.code} className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-foreground/20 pt-2 text-sm">
        <span><strong>{s.title}</strong> · <code className="font-mono">{s.code}</code> {s.active ? <span className="zine-tag">activa</span> : <span className="text-muted-foreground">cerrada</span>}</span>
        {s.active && <span className="flex gap-2"><Link to="/s/$code" params={{ code: s.code }} className={btn}>Abrir</Link><button type="button" onClick={() => copy(s.code)} className={btn}><Copy className="h-4 w-4" />Copiar</button><button type="button" onClick={() => closeM.mutate(s.code)} className={btn}>Cerrar</button></span>}
      </li>)}
    </ul>
  </section>;
}

function ArchivePanel() {
  const fn = useServerFn(listArchive);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const data = useQuery({ queryKey: ["live", "archive"], queryFn: () => fn(), enabled: open });
  const term = q.trim().toLowerCase();
  const rows = (data.data ?? []).filter(r => !term || `${r.songTitle} ${r.artist} ${r.course ?? ""}`.toLowerCase().includes(term));
  return <section className={box}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Archive className="h-5 w-5" /><h2 className="zine-title text-xl">Archivo de emitidas</h2></div><button type="button" onClick={() => setOpen(v => !v)} className={btn}>{open ? "Ocultar" : "Ver archivo"}</button></div>
    {open && <>
      <label className="mt-4 flex items-center gap-2 zine-input px-3"><Search className="h-4 w-4" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar canción, artista o clase" className="min-h-10 flex-1 bg-transparent outline-none" /></label>
      <p className="mt-3 text-sm text-muted-foreground">{rows.length} canciones emitidas</p>
      <ul className="mt-2 max-h-96 divide-y-2 divide-dashed divide-foreground/15 overflow-y-auto">
        {rows.map(r => <li key={r.id} className="flex justify-between gap-3 py-2 text-sm"><span><strong>{r.songTitle}</strong> — {r.artist}{r.course ? ` · ${r.course}` : ""}</span><span className="shrink-0 text-muted-foreground">{new Date(r.playedAt).toLocaleDateString("es-ES")}</span></li>)}
      </ul>
    </>}
  </section>;
}

function HelpInbox() {
  const qc = useQueryClient();
  const list = useServerFn(listHelpMessages), resolve = useServerFn(resolveHelpMessage);
  const msgs = useQuery({ queryKey: ["help"], queryFn: () => list(), refetchInterval: 60_000 });
  const m = useMutation({ mutationFn: (v: { id: number; resolved: boolean }) => resolve({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["help"] }) });
  const open = (msgs.data ?? []).filter(x => !x.resolved).length;
  return <section className={box}>
    <div className="flex items-center gap-3"><LifeBuoy className="h-5 w-5" /><h2 className="zine-title text-xl">Avisos de fallos</h2>{open > 0 && <span className="zine-tag">{open} sin leer</span>}</div>
    <ul className="mt-3 space-y-3">
      {(msgs.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">No hay mensajes.</li>}
      {(msgs.data ?? []).map(x => <li key={x.id} className={`border-2 border-foreground p-3 text-sm ${x.resolved ? "opacity-50" : "bg-accent/40"}`}>
        <p className="whitespace-pre-line">{x.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">{x.name || "Anónimo"}{x.contact ? ` · ${x.contact}` : ""}{x.page ? ` · ${x.page}` : ""} · {new Date(x.createdAt).toLocaleString("es-ES")}</p>
        <button type="button" onClick={() => m.mutate({ id: x.id, resolved: !x.resolved })} className={`${btn} mt-2`}>{x.resolved ? <><X className="h-4 w-4" />Reabrir</> : <><Check className="h-4 w-4" />Resuelto</>}</button>
      </li>)}
    </ul>
  </section>;
}
