import { useEffect, useState, type ChangeEvent } from "react";
import { ImagePlus, MessageSquareText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PopupValue = { popupEnabled?: boolean; popupTitle?: string | null; popupText?: string | null; popupImageUrl?: string | null };
type Props = {
  control?: { popupEnabled: boolean; popupTitle: string | null; popupText: string | null; popupImageUrl: string | null } | undefined;
  onSave: (value: PopupValue) => void;
};

/** Shrinks an uploaded photo to a compact JPEG so it can be stored with the site settings. */
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/** Owner-only editor for the pop-up window visitors see when they open the site. */
export function PopupPanel({ control, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    setTitle(control?.popupTitle ?? "");
    setText(control?.popupText ?? "");
    setImage(control?.popupImageUrl ?? null);
  }, [control?.popupTitle, control?.popupText, control?.popupImageUrl]);
  const enabled = Boolean(control?.popupEnabled);

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Elige una imagen");
    try { setImage(await shrinkImage(file)); } catch { toast.error("No se pudo leer la imagen"); }
  };

  return (
    <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-white"><MessageSquareText className="h-4 w-4 text-cyan-200" />Ventana emergente</p>
          <p className="mt-1 text-xs text-slate-400">Aparece al abrir la web, también cuando está bloqueada. Puede llevar foto.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${enabled ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-slate-400"}`}>{enabled ? "Activa" : "Apagada"}</span>
      </div>
      <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Título" className="mt-4 border-white/10 bg-[#07111f] text-white" />
      <Textarea value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="Mensaje" className="mt-3 border-white/10 bg-[#07111f] text-white" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {image && <img src={image} alt="Foto de la ventana" className="h-20 w-20 rounded-xl object-cover" />}
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-slate-200 hover:bg-white/10">
          <ImagePlus className="h-4 w-4" />{image ? "Cambiar foto" : "Añadir foto"}
          <input type="file" accept="image/*" className="sr-only" onChange={pick} />
        </label>
        {image && <Button type="button" variant="ghost" onClick={() => setImage(null)} className="text-slate-300"><Trash2 className="mr-1.5 h-4 w-4" />Quitar foto</Button>}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => onSave({ popupEnabled: true, popupTitle: title, popupText: text, popupImageUrl: image })} className="bg-cyan-300 text-[#07111f] hover:bg-cyan-200">Guardar y mostrar</Button>
        {enabled && <Button variant="outline" onClick={() => onSave({ popupEnabled: false })} className="border-white/10 bg-transparent text-slate-200">Apagar ventana</Button>}
      </div>
    </section>
  );
}
