import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LockKeyhole, Users } from "lucide-react";
import { INFO_URL } from "@/lib/site-lock";
import logoAsset from "@/assets/logo_disco_patio.png.asset.json";

const logoPath = logoAsset.url;
const TICKER = "PRÓXIMAMENTE · RADIO PATIO LAS AMÉRICAS · NUEVA WEB DISCOPATIO";

export function ComingSoon() {
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
          {[0, 1].map(i => <span key={i}>{TICKER}</span>)}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <img src={logoPath} alt="Radio Patio Las Américas" className="coming-soon-rise h-16 w-16 rounded-full border border-blue-300/25 object-cover sm:h-20 sm:w-20" />

        <div className="coming-soon-rise radio-dynamic-glow mt-7 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 sm:h-24 sm:w-24">
          <LockKeyhole className="h-9 w-9 text-cyan-300 sm:h-11 sm:w-11" aria-hidden="true" />
        </div>

        <p className="coming-soon-rise mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300 sm:text-xs">Radio Patio Las Américas</p>

        <h1 id="coming-soon-title" className="coming-soon-rise mt-4 text-[clamp(2.4rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.06em] text-white">
          PRÓXIMAMENTE
          <span className="inline-flex gap-1 align-baseline" aria-hidden="true">
            {[0, 1, 2].map(i => <span key={i} className="coming-soon-dot h-2 w-2 rounded-full bg-cyan-300 sm:h-3 sm:w-3" style={{ animationDelay: `${i * 220}ms` }} />)}
          </span>
        </h1>

        <p className="coming-soon-rise mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-lg">
          La nueva web de <strong className="text-white">Radio Patio Las Américas</strong> está cerrada mientras la preparamos.
          Las peticiones de canciones volverán muy pronto.
        </p>

        <div className="coming-soon-rise mt-8 w-full max-w-md rounded-2xl border border-blue-200/15 bg-blue-300/[0.07] px-5 py-4">
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
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 transition hover:text-cyan-200 sm:text-xs">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Acceso equipo y admins
        </Link>
      </footer>
    </div>
  );
}
