import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ownerSetDeviceBlocked, teamListDevices } from "@/lib/radio.functions";

type Props = {
  isOwner: boolean;
  control?: { perDeviceLimit: number; altOpen: boolean } | undefined;
  onSave: (v: { perDeviceLimit?: number; altOpen?: boolean }) => void;
};

export function DevicesPanel({ isOwner, control, onSave }: Props) {
  const listFn = useServerFn(teamListDevices);
  const blockFn = useServerFn(ownerSetDeviceBlocked);
  const devices = useQuery({ queryKey: ["team", "devices"], queryFn: () => listFn(), refetchInterval: 30_000 });
  const [limit, setLimit] = useState("");
  const block = useMutation({
    mutationFn: (v: { deviceId: string; blocked: boolean }) => blockFn({ data: v }),
    onSuccess: (_r, v) => { devices.refetch(); toast.success(v.blocked ? "Dispositivo bloqueado" : "Dispositivo desbloqueado"); },
    onError: (e: Error) => toast.error("No se pudo cambiar", { description: e.message }),
  });
  return (
    <section className="mt-4 rounded-3xl border border-cyan-300/15 bg-white/[0.035] p-4 sm:p-5">
      <div className="flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-cyan-300" /><p className="font-semibold text-white">Dispositivos esta semana</p></div>
      <p className="mt-1 text-xs text-slate-400">Huella anónima por navegador. La semana empieza el jueves a las 14:00.</p>
      {isOwner && control && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-300">Límite por dispositivo: <b className="text-white">{control.perDeviceLimit}</b></span>
          <Input value={limit} onChange={e => setLimit(e.target.value.replace(/\D/g, ""))} placeholder="Nuevo" className="h-9 w-20 border-white/10 bg-[#07111f] text-white" />
          <Button size="sm" onClick={() => { const n = Number(limit); if (n >= 1 && n <= 20) { onSave({ perDeviceLimit: n }); setLimit(""); } else toast.error("Pon un número entre 1 y 20"); }}>Guardar</Button>
          <Button size="sm" variant="outline" className="border-white/15 bg-transparent text-slate-100" onClick={() => onSave({ altOpen: !control.altOpen })}>{control.altOpen ? "Cerrar buzón alternativo" : "Abrir buzón alternativo"}</Button>
        </div>
      )}
      <div className="mt-3 space-y-2">
        {(devices.data?.length ?? 0) === 0 ? <p className="text-sm text-slate-500">Aún no hay envíos con huella esta semana.</p> : devices.data?.map(d => (
          <div key={d.deviceId} className="flex items-center justify-between gap-3 rounded-xl bg-[#07111f]/60 px-3 py-2 text-xs">
            <span className="min-w-0 text-slate-300"><span className="font-mono text-slate-500">{d.deviceId.slice(0, 8)}</span> · {d.deviceType ?? "—"} · {d.browser ?? "—"}</span>
            <span className="flex shrink-0 items-center gap-2"><b className="text-cyan-200">{d.count} canc.</b>{d.blocked && <span className="text-red-300">bloqueado</span>}{isOwner && <Button size="sm" variant="outline" className="h-7 border-white/15 bg-transparent px-2 text-[11px] text-slate-100" onClick={() => block.mutate({ deviceId: d.deviceId, blocked: !d.blocked })}>{d.blocked ? "Desbloquear" : "Bloquear"}</Button>}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
