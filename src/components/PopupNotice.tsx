import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = { title: string | null | undefined; text: string | null | undefined; image: string | null | undefined; version: string };

/** Pop-up shown once per visit (and again whenever the owner changes it). */
export function PopupNotice({ title, text, image, version }: Props) {
  const [open, setOpen] = useState(false);
  const key = `discopatio-popup-${version}`;
  useEffect(() => { setOpen(window.sessionStorage.getItem(key) !== "seen"); }, [key]);
  if (!open || (!title && !text && !image)) return null;
  const close = () => { window.sessionStorage.setItem(key, "seen"); setOpen(false); };
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#020814]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title ?? "Aviso"} onClick={close}>
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-300/25 bg-[#07111f] text-slate-100 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={close} aria-label="Cerrar" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#020814]/70 text-slate-200 hover:text-white"><X className="h-5 w-5" /></button>
        {image && <img src={image} alt="" className="max-h-[50vh] w-full object-cover" />}
        <div className="p-5 sm:p-6">
          {title && <h2 className="pr-8 text-2xl font-bold tracking-tight text-white">{title}</h2>}
          {text && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{text}</p>}
          <button onClick={close} className="mt-5 h-11 w-full rounded-xl bg-cyan-300 font-semibold text-[#07111f] hover:bg-cyan-200">Entendido</button>
        </div>
      </div>
    </div>
  );
}
