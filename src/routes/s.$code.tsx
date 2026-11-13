import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, CalendarClock, CheckCheck, ExternalLink, Undo2, X } from "lucide-react";
import { getLiveSession, markLiveSong, type LiveSong } from "@/lib/live.functions";

export const Route = createFileRoute("/s/$code")({
  head: () => ({ meta: [
    { title: "Sesión en directo · DiscoPatio" },
    { name: "description", content: "Sesión privada del equipo de Radio Patio para elegir las canciones del jueves." },
    { property: "og:title", content: "Sesión en directo · DiscoPatio" },
    { property: "og:description", content: "Elige con el equipo qué suena este jueves." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: LivePage,
});

type Action = "this_week" | "next_week" | "reject" | "played" | "clear";
const searchLinks = (s: LiveSong) => {
  const q = encodeURIComponent(`${s.songTitle} ${s.artist}`);
  return { yt: `https://www.youtube.com/results?search_query=${q}`, sp: `https://open.spotify.com/search/${q}` };
};

function LivePage() {
  const { code } = Route.useParams();
  const qc = useQueryClient();
  const get = useServerFn(getLiveSession), mark = useServerFn(markLiveSong);
  const q = useQuery({ queryKey: ["live-session", code], queryFn: () => get({ data: { code } }), refetchInterval: 4000, retry: false });
  const m = useMutation({ mutationFn: (v: { id: number; action: Action }) => mark({ data: { code, ...v } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["live-session", code] }), onError: (e: Error) => toast.error(e.message) });

  if (q.isLoading) return <main className="container py-16 text-center">Cargando sesión…</main>;
  if (q.error || !q.data) return <main className="container py-16 text-center"><h1 className="zine-title text-3xl">Enlace no activo</h1><p className="mt-3 text-muted-foreground">Pide al coordinador un enlace nuevo.</p><Link to="/" className="zine-btn mt-6 inline-flex min-h-10 items-center px-4">Volver al inicio</Link></main>;

  const songs = q.data.songs;
  const groups: Array<[string, LiveSong[]]> = [
    ["Este jueves", songs.filter(s => s.scheduledFor === "this_week")],
    ["Para la próxima", songs.filter(s => s.scheduledFor === "next_week")],
    ["Sin decidir", songs.filter(s => !s.scheduledFor)],
  ];
  return <main className="container max-w-4xl py-8 sm:py-12">
    <p className="zine-tag">En directo · se actualiza solo</p>
    <h1 className="zine-title mt-3 text-3xl sm:text-4xl">{q.data.title}</h1>
    <p className="mt-2 text-sm text-muted-foreground">Activa hasta las {new Date(q.data.expiresAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}. Todo el que tenga este enlace ve los mismos cambios.</p>
    {groups.map(([label, list]) => <section key={label} className="mt-8">
      <h2 className="zine-title text-xl">{label} <span className="text-muted-foreground">({list.length})</span></h2>
      {list.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Nada por aquí.</p>}
      <ul className="mt-3 space-y-3">{list.map(s => { const l = searchLinks(s); return <li key={s.id} className="zine-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-lg font-bold leading-tight">{s.songTitle}</p><p className="text-sm">{s.artist}{s.course ? ` · ${s.course}` : ""}</p></div>
          <div className="flex gap-2 text-sm"><a href={l.yt} target="_blank" rel="noreferrer" className="zine-btn inline-flex min-h-9 items-center gap-1 px-3">YouTube<ExternalLink className="h-3.5 w-3.5" /></a><a href={l.sp} target="_blank" rel="noreferrer" className="zine-btn inline-flex min-h-9 items-center gap-1 px-3">Spotify<ExternalLink className="h-3.5 w-3.5" /></a></div></div>
        {s.dedication && <p className="mt-2 border-l-4 border-primary pl-3 text-sm italic">{s.dedication}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button onClick={() => m.mutate({ id: s.id, action: "this_week" })} className={`zine-btn inline-flex min-h-10 items-center gap-1 px-3 ${s.scheduledFor === "this_week" ? "zine-btn-primary" : ""}`}><CalendarCheck className="h-4 w-4" />Este jueves</button>
          <button onClick={() => m.mutate({ id: s.id, action: "next_week" })} className={`zine-btn inline-flex min-h-10 items-center gap-1 px-3 ${s.scheduledFor === "next_week" ? "zine-btn-primary" : ""}`}><CalendarClock className="h-4 w-4" />Próxima</button>
          <button onClick={() => m.mutate({ id: s.id, action: "played" })} className="zine-btn inline-flex min-h-10 items-center gap-1 px-3"><CheckCheck className="h-4 w-4" />Ya sonó</button>
          <button onClick={() => m.mutate({ id: s.id, action: "reject" })} className="zine-btn inline-flex min-h-10 items-center gap-1 px-3"><X className="h-4 w-4" />No va</button>
          {s.scheduledFor && <button onClick={() => m.mutate({ id: s.id, action: "clear" })} className="zine-btn inline-flex min-h-10 items-center gap-1 px-3"><Undo2 className="h-4 w-4" />Quitar</button>}
        </div>
      </li>; })}</ul>
    </section>)}
  </main>;
}
