import { FormEvent, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Megaphone, Music2, Pin, Plus, Trash2 } from "lucide-react";
import {
  listAvisosForTeam, listAudiosForTeam, ownerDeleteAviso, ownerDeleteAudio, ownerSaveAviso, ownerSaveAudio,
} from "@/lib/avisos.functions";

const kindLabels = { aviso: "Aviso", norma: "Norma", programa: "Programa" } as const;
type Kind = keyof typeof kindLabels;

const toIso = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
};
const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

const emptyAviso = { title: "", body: "", kind: "aviso" as Kind, pinned: false, published: true, publishAt: "", expiresAt: "" };
const emptyAudio = { title: "", programDate: "", description: "", audioUrl: "", durationSeconds: "", published: true };

export function AvisosPanel({ isOwner }: { isOwner: boolean }) {
  const qc = useQueryClient();
  const avisosFn = useServerFn(listAvisosForTeam);
  const audiosFn = useServerFn(listAudiosForTeam);
  const saveAvisoFn = useServerFn(ownerSaveAviso);
  const deleteAvisoFn = useServerFn(ownerDeleteAviso);
  const saveAudioFn = useServerFn(ownerSaveAudio);
  const deleteAudioFn = useServerFn(ownerDeleteAudio);

  const avisos = useQuery({ queryKey: ["avisos-team"], queryFn: () => avisosFn(), enabled: isOwner });
  const audios = useQuery({ queryKey: ["audios-team"], queryFn: () => audiosFn(), enabled: isOwner });

  const [avisoForm, setAvisoForm] = useState(emptyAviso);
  const [avisoId, setAvisoId] = useState<number | null>(null);
  const [audioForm, setAudioForm] = useState(emptyAudio);
  const [audioId, setAudioId] = useState<number | null>(null);

  const saveAviso = useMutation({
    mutationFn: () => saveAvisoFn({
      data: {
        ...(avisoId ? { id: avisoId } : {}),
        title: avisoForm.title, body: avisoForm.body, kind: avisoForm.kind,
        pinned: avisoForm.pinned, published: avisoForm.published,
        publishAt: toIso(avisoForm.publishAt), expiresAt: toIso(avisoForm.expiresAt),
      },
    }),
    onSuccess: () => { toast.success("Aviso guardado"); setAvisoForm(emptyAviso); setAvisoId(null); qc.invalidateQueries({ queryKey: ["avisos-team"] }); qc.invalidateQueries({ queryKey: ["avisos-public"] }); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "No se pudo guardar el aviso"),
  });

  const removeAviso = useMutation({
    mutationFn: (id: number) => deleteAvisoFn({ data: { id } }),
    onSuccess: () => { toast.success("Aviso borrado"); qc.invalidateQueries({ queryKey: ["avisos-team"] }); qc.invalidateQueries({ queryKey: ["avisos-public"] }); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "No se pudo borrar el aviso"),
  });

  const saveAudio = useMutation({
    mutationFn: () => saveAudioFn({
      data: {
        ...(audioId ? { id: audioId } : {}),
        title: audioForm.title, programDate: audioForm.programDate || null,
        description: audioForm.description || null, audioUrl: audioForm.audioUrl,
        durationSeconds: audioForm.durationSeconds ? Number(audioForm.durationSeconds) : null,
        published: audioForm.published,
      },
    }),
    onSuccess: () => { toast.success("Audio guardado"); setAudioForm(emptyAudio); setAudioId(null); qc.invalidateQueries({ queryKey: ["audios-team"] }); qc.invalidateQueries({ queryKey: ["audios-public"] }); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "No se pudo guardar el audio"),
  });

  const removeAudio = useMutation({
    mutationFn: (id: number) => deleteAudioFn({ data: { id } }),
    onSuccess: () => { toast.success("Audio borrado"); qc.invalidateQueries({ queryKey: ["audios-team"] }); qc.invalidateQueries({ queryKey: ["audios-public"] }); },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "No se pudo borrar el audio"),
  });

  const submitAviso = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (avisoForm.title.trim().length < 2 || avisoForm.body.trim().length < 3) { toast.error("Falta el título o el texto del aviso"); return; }
    saveAviso.mutate();
  };
  const submitAudio = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (audioForm.title.trim().length < 2 || !audioForm.audioUrl.trim().startsWith("https://")) { toast.error("Falta el título o el enlace https:// del audio"); return; }
    saveAudio.mutate();
  };

  const editAviso = (a: NonNullable<typeof avisos.data>[number]) => {
    setAvisoId(a.id);
    setAvisoForm({ title: a.title, body: a.body, kind: a.kind, pinned: a.pinned, published: a.published, publishAt: toLocalInput(a.publishAt), expiresAt: toLocalInput(a.expiresAt) });
  };
  const editAudio = (a: NonNullable<typeof audios.data>[number]) => {
    setAudioId(a.id);
    setAudioForm({ title: a.title, programDate: a.programDate ?? "", description: a.description ?? "", audioUrl: a.audioUrl, durationSeconds: a.durationSeconds ? String(a.durationSeconds) : "", published: a.published });
  };

  const field = "w-full rounded-xl border border-white/10 bg-[#07111f] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300";
  const label = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500";

  return <div className="mt-4 grid gap-4 lg:grid-cols-2">
    <section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-cyan-300" />
        <p className="font-semibold text-white">Avisos para la página de avisos</p>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] text-cyan-200">{avisos.data?.length ?? 0}</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Se ven en /avisos, ordenados con los fijados primero.</p>

      {isOwner && <form onSubmit={submitAviso} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[#07111f]/60 p-3">
        <div><span className={label}>Título</span><input className={field} value={avisoForm.title} onChange={e => setAvisoForm({ ...avisoForm, title: e.target.value })} maxLength={120} placeholder="Ej.: Cambio de horario del recreo" /></div>
        <div><span className={label}>Texto</span><textarea className={`${field} min-h-24`} value={avisoForm.body} onChange={e => setAvisoForm({ ...avisoForm, body: e.target.value })} maxLength={4000} placeholder="Escribe el aviso tal y como lo verá el alumnado" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><span className={label}>Tipo</span><select className={field} value={avisoForm.kind} onChange={e => setAvisoForm({ ...avisoForm, kind: e.target.value as Kind })}>{(Object.keys(kindLabels) as Kind[]).map(k => <option key={k} value={k}>{kindLabels[k]}</option>)}</select></div>
          <div><span className={label}>Publicar desde</span><input type="datetime-local" className={field} value={avisoForm.publishAt} onChange={e => setAvisoForm({ ...avisoForm, publishAt: e.target.value })} /></div>
          <div><span className={label}>Publicar hasta (opcional)</span><input type="datetime-local" className={field} value={avisoForm.expiresAt} onChange={e => setAvisoForm({ ...avisoForm, expiresAt: e.target.value })} /></div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={avisoForm.pinned} onChange={e => setAvisoForm({ ...avisoForm, pinned: e.target.checked })} />Fijar arriba</label>
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={avisoForm.published} onChange={e => setAvisoForm({ ...avisoForm, published: e.target.checked })} />Publicado</label>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saveAviso.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-[#07111f] hover:bg-cyan-200 disabled:opacity-50">{saveAviso.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{avisoId ? "Guardar cambios" : "Añadir aviso"}</button>
          {avisoId && <button type="button" onClick={() => { setAvisoId(null); setAvisoForm(emptyAviso); }} className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>}
        </div>
      </form>}

      <div className="mt-3 space-y-2">
        {(avisos.data ?? []).map(a => <div key={a.id} className="rounded-2xl border border-white/10 bg-[#07111f]/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{a.pinned && <Pin className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />}{a.title}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">{kindLabels[a.kind]} · {a.published ? "publicado" : "oculto"}{a.publishAt ? ` · desde ${new Date(a.publishAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}` : ""}</p>
            </div>
            {isOwner && <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => editAviso(a)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Editar aviso"><Eye className="h-4 w-4" /></button>
              <button type="button" onClick={() => removeAviso.mutate(a.id)} disabled={removeAviso.isPending} className="rounded-lg p-2 text-red-300/80 hover:bg-red-400/10 hover:text-red-200" aria-label="Borrar aviso"><Trash2 className="h-4 w-4" /></button>
            </div>}
          </div>
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-slate-400">{a.body}</p>
        </div>)}
        {isOwner && (avisos.data ?? []).length === 0 && <p className="text-xs text-slate-500">Todavía no hay avisos.</p>}
      </div>
    </section>

    <section className="rounded-3xl border border-blue-300/15 bg-blue-300/[0.06] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Music2 className="h-4 w-4 text-cyan-300" />
        <p className="font-semibold text-white">Audios de programas pasados</p>
        <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-2 py-0.5 font-mono text-[10px] text-blue-200">{audios.data?.length ?? 0}</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Enlace https:// del audio (subido a la nube del centro o a un servidor del equipo).</p>

      {isOwner && <form onSubmit={submitAudio} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[#07111f]/60 p-3">
        <div><span className={label}>Título</span><input className={field} value={audioForm.title} onChange={e => setAudioForm({ ...audioForm, title: e.target.value })} maxLength={120} placeholder="Ej.: Discopatio · 13 de noviembre" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><span className={label}>Fecha del programa</span><input type="date" className={field} value={audioForm.programDate} onChange={e => setAudioForm({ ...audioForm, programDate: e.target.value })} /></div>
          <div><span className={label}>Duración en segundos (opcional)</span><input type="number" min={1} max={36000} className={field} value={audioForm.durationSeconds} onChange={e => setAudioForm({ ...audioForm, durationSeconds: e.target.value })} placeholder="1800" /></div>
        </div>
        <div><span className={label}>Enlace del audio (https://)</span><input className={field} value={audioForm.audioUrl} onChange={e => setAudioForm({ ...audioForm, audioUrl: e.target.value })} maxLength={500} placeholder="https://…" /></div>
        <div><span className={label}>Descripción (opcional)</span><textarea className={`${field} min-h-16`} value={audioForm.description} onChange={e => setAudioForm({ ...audioForm, description: e.target.value })} maxLength={1000} /></div>
        <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={audioForm.published} onChange={e => setAudioForm({ ...audioForm, published: e.target.checked })} />Publicado</label>
        <div className="flex gap-2">
          <button type="submit" disabled={saveAudio.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-[#07111f] hover:bg-cyan-200 disabled:opacity-50">{saveAudio.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{audioId ? "Guardar cambios" : "Añadir audio"}</button>
          {audioId && <button type="button" onClick={() => { setAudioId(null); setAudioForm(emptyAudio); }} className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>}
        </div>
      </form>}

      <div className="mt-3 space-y-2">
        {(audios.data ?? []).map(a => <div key={a.id} className="rounded-2xl border border-white/10 bg-[#07111f]/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{a.title}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">{a.programDate ?? "sin fecha"} · {a.published ? "publicado" : "oculto"}</p>
            </div>
            {isOwner && <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => editAudio(a)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Editar audio"><EyeOff className="h-4 w-4" /></button>
              <button type="button" onClick={() => removeAudio.mutate(a.id)} disabled={removeAudio.isPending} className="rounded-lg p-2 text-red-300/80 hover:bg-red-400/10 hover:text-red-200" aria-label="Borrar audio"><Trash2 className="h-4 w-4" /></button>
            </div>}
          </div>
          <p className="mt-2 truncate text-xs text-slate-500">{a.audioUrl}</p>
        </div>)}
        {isOwner && (audios.data ?? []).length === 0 && <p className="text-xs text-slate-500">Todavía no hay audios.</p>}
      </div>
    </section>
  </div>;
}
