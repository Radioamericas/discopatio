import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AccountSignIn } from "@/components/radio/AccountAccess";
import { ArrowUpRight, LockKeyhole, Users } from "lucide-react";
import { INFO_URL } from "@/lib/site-lock";
import logoAsset from "@/assets/logo_disco_patio.png.asset.json";

const logoPath = logoAsset.url;
const TICKER = "PRÓXIMAMENTE · RADIO PATIO LAS AMÉRICAS · NUEVA WEB DISCOPATIO";

export function ComingSoon({ note, banner, reopenAt, onReopen }: { note?: string | null | undefined; banner?: string | null | undefined; reopenAt?: number | null; onReopen?: () => void }) {
  const [signIn, setSignIn] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!reopenAt) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [reopenAt]);
  const left = reopenAt && now !== null ? Math.max(0, reopenAt - now) : null;
  useEffect(() => { if (left === 0) onReopen?.(); }, [left === 0]);
  const navigate = useNavigate();
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="coming-soon-scrim fixed inset-0 z-[300] flex flex-col overflow-y-auto text-slate-100" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title">
      <div className="coming-soon-ticker" aria-hidden="true">
        <div className="coming-soon-ticker-track">
          {[0, 1].map(i => <span key={i}>{banner || TICKER}</span>)}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <img src={logoPath} alt="Radio Patio Las Américas" className="coming-soon-rise h-16 w-16 rounded-full border border-blue-300/25 object-cover sm:h-20 sm:w-20" style={{ animationDelay: "0ms" }} />

        <div className="coming-soon-rise radio-dynamic-glow mt-7 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 sm:h-24 sm:w-24" style={{ animationDelay: "90ms" }}>
          <LockKeyhole className="h-9 w-9 text-cyan-300 sm:h-11 sm:w-11" aria-hidden="true" />
        </div>

        <p className="coming-soon-rise mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300 sm:text-xs" style={{ animationDelay: "170ms" }}>Radio Patio Las Américas</p>

        <h1 id="coming-soon-title" className="coming-soon-rise mt-4 text-[clamp(2.4rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.06em] text-white" style={{ animationDelay: "250ms" }}>
          <span className="inline-flex flex-wrap items-center justify-center gap-x-3">
            PRÓXIMAMENTE
            <span className="inline-flex gap-1" aria-hidden="true">
              {[0, 1, 2].map(i => <span key={i} className="coming-soon-dot h-2 w-2 rounded-full bg-cyan-300 sm:h-3 sm:w-3" style={{ animationDelay: `${i * 220}ms` }} />)}
            </span>
          </span>
        </h1>

        <p className="coming-soon-rise mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-lg" style={{ animationDelay: "340ms" }}>
          La nueva web de <strong className="text-white">Radio Patio Las Américas</strong> está cerrada mientras la preparamos.
          Las peticiones de canciones volverán muy pronto.
        </p>

        {reopenAt && left !== null && (
          <div className="coming-soon-rise mt-6 w-full max-w-xl" style={{ animationDelay: "360ms" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">Reabrimos el {new Date(reopenAt).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
            <div className="mt-3 grid grid-cols-4 gap-2" aria-live="polite">
              {([["Días", 86400000], ["Horas", 3600000], ["Min", 60000], ["Seg", 1000]] as const).map(([label, ms], i, arr) => {
                const value = Math.floor((i === 0 ? left : left % arr[i - 1][1]) / ms);
                return <div key={label} className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] py-3"><p className="font-mono text-2xl font-semibold text-white sm:text-4xl">{String(value).padStart(2, "0")}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</p></div>;
              })}
            </div>
          </div>
        )}

        {note && (
          <div className="coming-soon-rise mt-5 w-full max-w-xl rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] px-5 py-4 text-left" style={{ animationDelay: "380ms" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200/80">Nota del equipo</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-50">{note}</p>
          </div>
        )}

        <div className="coming-soon-rise mt-8 w-full max-w-md rounded-2xl border border-blue-200/15 bg-blue-300/[0.07] px-5 py-4" style={{ animationDelay: "430ms" }}>
          <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">Para más info visita</p>
          <a
            href={INFO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-2 break-all text-base font-semibold text-cyan-200 underline underline-offset-4 hover:text-white sm:text-lg"
          >
            {INFO_URL.replace(/^https:\/\//, "")}
            <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      <footer className="border-t border-white/10 px-5 py-4 text-center">
        {signIn && <div className="mx-auto mb-4 w-full max-w-sm"><AccountSignIn onDone={() => navigate({ to: "/admin" })} /></div>}
        <button type="button" onClick={() => setSignIn(v => !v)} className="mr-4 inline-flex min-h-11 items-center text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-200 hover:text-white sm:text-xs">{signIn ? "Cerrar inicio de sesión" : "Iniciar sesión (usuario o correo)"}</button>
        <Link to="/admin" className="inline-flex min-h-11 items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 transition hover:text-cyan-200 sm:text-xs">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Acceso equipo y admins
        </Link>
      </footer>
    </div>
  );
}
