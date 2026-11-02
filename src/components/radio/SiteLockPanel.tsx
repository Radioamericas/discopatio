import { useEffect, useState } from "react";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  control?: { siteLocked: boolean; lockNote: string | null } | undefined;
  onSave: (value: { siteLocked?: boolean; lockNote?: string | null }) => void;
};

/** Owner-only switch that freezes the public site behind the "Próximamente" screen with an optional note. */
export function SiteLockPanel({ control, onSave }: Props) {
  const [note, setNote] = useState("");
  useEffect(() => { setNote(control?.lockNote ?? ""); }, [control?.lockNote]);
  const locked = Boolean(control?.siteLocked);
  return (
    <section className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">Bloquear toda la web</p>
          <p className="mt-1 text-xs text-slate-400">Los visitantes verán «Próximamente» con tu nota. Este panel sigue funcionando.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${locked ? "border-amber-300/30 bg-amber-300/15 text-amber-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"}`}>{locked ? "Bloqueada" : "Abierta"}</span>
      </div>
      <Textarea value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="Nota para los visitantes (opcional)" className="mt-4 border-white/10 bg-[#07111f] text-white" />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => onSave({ siteLocked: !locked, lockNote: note })} className={locked ? "bg-emerald-300 text-[#07111f] hover:bg-emerald-200" : "bg-amber-300 text-[#07111f] hover:bg-amber-200"}>
          {locked ? <><LockKeyholeOpen className="mr-1.5 h-4 w-4" />Desbloquear web</> : <><LockKeyhole className="mr-1.5 h-4 w-4" />Bloquear web</>}
        </Button>
        <Button variant="outline" onClick={() => onSave({ lockNote: note })} className="border-white/10 bg-transparent text-slate-200">Guardar nota</Button>
      </div>
    </section>
  );
}
