import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Megaphone, Music2, Pin, Radio, Clock3 } from "lucide-react";
import { listAvisos, listProgramAudios } from "@/lib/avisos.functions";
import { AVISOS_URL } from "@/lib/site-lock";
import logoAsset from "@/assets/logo_disco_patio.png.asset.json";

const logoPath = logoAsset.url;

const kindLabels = { aviso: "Aviso", norma: "Norma", programa: "Programa" } as const;
const kindStyles = {
  aviso: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  norma: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  programa: "border-blue-300/25 bg-blue-300/10 text-blue-200",
} as const;

const formatDate = (value: string | null) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" })
  : null;
const formatStamp = (value: string) => new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Madrid" });
const formatDuration = (seconds: number | null) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function AvisosPage() {
  const avisosFn = useServerFn(listAvisos);
  const audiosFn = useServerFn(listProgramAudios);
  const avisos = useQuery({ queryKey: ["avisos-public"], queryFn: () => avisosFn(), refetchInterval: 60_000 });
  const audios = useQuery({ queryKey: ["audios-public"], queryFn: () => audiosFn(), refetchInterval: 60_000 });

  return <div className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
    <header className="welcome-header relative z-10 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img src={logoPath} alt="Radio Patio Las Américas" className="h-11 w-11 rounded-full border border-blue-300/30 object-cover sm:h-12 sm:w-12" />
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-blue-200/70">Radio América</p>
            <p className="truncate text-sm font-bold sm:text-lg">Avisos y biblioteca de audios</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-200 sm:inline">En fase beta</span>
          <Link to="/" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20 sm:text-sm"><ArrowLeft className="h-4 w-4" />Volver al buzón</Link>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 pb-14 pt-9 sm:px-5 lg:px-8">
      <section className="welcome-hero relative">
        <span className="welcome-badge inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200"><Radio className="h-3.5 w-3.5" />Radio Patio Las Américas</span>
        <h1 className="welcome-title mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">Avisos y audios del programa</h1>
        <p className="welcome-copy mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Aquí van saliendo los avisos del equipo y los audios provisionales de los programas ya emitidos. Es una biblioteca en fase beta: puede cambiar o faltarse algo.</p>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-cyan-300" />
          <h2 className="text-xl font-bold text-white sm:text-2xl">Avisos</h2>
          {avisos.data && avisos.data.length > 0 && <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200">{avisos.data.length}</span>}
        </div>
        {avisos.isLoading ? <p className="mt-4 text-sm text-slate-400">Cargando avisos…</p>
          : !avisos.data || avisos.data.length === 0 ? <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-sm text-slate-400">Todavía no hay avisos publicados.</div>
          : <div className="mt-4 grid gap-3 sm:grid-cols-2">{avisos.data.map(a => <article key={a.id} className={`rounded-3xl border p-5 ${a.pinned ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.035]"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${kindStyles[a.kind]}`}>{kindLabels[a.kind]}</span>
              {a.pinned && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-300"><Pin className="h-3 w-3" />Fijado</span>}
              <span className="ml-auto font-mono text-[10px] text-slate-500">{formatStamp(a.createdAt)}</span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">{a.title}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">{a.body}</p>
            {a.expiresAt && <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500"><Clock3 className="h-3 w-3" />Hasta {formatDate(a.expiresAt.slice(0, 10))}</p>}
          </article>)}</div>}
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-cyan-300" />
          <h2 className="text-xl font-bold text-white sm:text-2xl">Audios de programas pasados</h2>
          {audios.data && audios.data.length > 0 && <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200">{audios.data.length}</span>}
        </div>
        {audios.isLoading ? <p className="mt-4 text-sm text-slate-400">Cargando audios…</p>
          : !audios.data || audios.data.length === 0 ? <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-sm text-slate-400">Aún no hay audios subidos. En cuanto grabemos un programa, se podrá escuchar aquí.</div>
          : <div className="mt-4 grid gap-3 sm:grid-cols-2">{audios.data.map(a => <article key={a.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-white sm:text-lg">{a.title}</h3>
              {a.durationSeconds && <span className="shrink-0 font-mono text-[10px] text-slate-500">{formatDuration(a.durationSeconds)}</span>}
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">{formatDate(a.programDate) ?? "Programa sin fecha"}</p>
            {a.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">{a.description}</p>}
            <audio controls preload="none" src={a.audioUrl} className="mt-4 h-9 w-full" aria-label={`Escuchar ${a.title}`} />
          </article>)}</div>}
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <p className="text-sm leading-6 text-slate-400">Esta página guarda avisos y audios en la misma base de datos que las canciones del buzón, así que todo se gestiona desde un solo sitio. Mientras acaba de afinarse, existe una versión aparte en <a href={AVISOS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-200 underline underline-offset-2 hover:text-white">avisosdiscopatio.lovable.app<ExternalLink className="h-3 w-3" /></a>.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <Link to="/" className="text-blue-200/80 underline underline-offset-2 hover:text-white">Buzón de canciones</Link>
          <Link to="/privacidad" className="text-blue-200/80 underline underline-offset-2 hover:text-white">Privacidad</Link>
          <Link to="/cookies" className="text-blue-200/80 underline underline-offset-2 hover:text-white">Política de cookies</Link>
          <Link to="/aviso-legal" className="text-blue-200/80 underline underline-offset-2 hover:text-white">Aviso legal</Link>
        </div>
      </section>
    </main>
  </div>;
}
