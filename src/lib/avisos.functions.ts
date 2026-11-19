import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAccess, getAdmin } from "@/lib/radio.server";

async function requireTeam() {
  if (!(await getAccess()).team) throw new Error("Necesitas entrar como equipo.");
}
async function requireOwner() {
  if (!(await getAccess()).owner) throw new Error("Solo el coordinador puede hacer esto.");
}

const AVISO_KINDS = ["aviso", "norma", "programa"] as const;
const isoOrNull = z.string().datetime().nullable().optional();
const httpsUrl = z.string().trim().url().refine(v => v.startsWith("https://"), "El enlace debe empezar por https://");

type Aviso = {
  id: number; title: string; body: string; kind: (typeof AVISO_KINDS)[number];
  pinned: boolean; published: boolean; publishAt: string | null; expiresAt: string | null; createdAt: string;
};
type Audio = {
  id: number; title: string; programDate: string | null; description: string | null;
  audioUrl: string; durationSeconds: number | null; published: boolean; createdAt: string;
};

const mapAviso = (r: any): Aviso => ({
  id: r.id, title: r.title, body: r.body, kind: r.kind, pinned: r.pinned, published: r.published,
  publishAt: r.publish_at, expiresAt: r.expires_at, createdAt: r.created_at,
});
const mapAudio = (r: any): Audio => ({
  id: r.id, title: r.title, programDate: r.program_date, description: r.description,
  audioUrl: r.audio_url, durationSeconds: r.duration_seconds, published: r.published, createdAt: r.created_at,
});

// ---------- Public reads: what anyone can see on /avisos ----------
export const listAvisos = createServerFn({ method: "GET" }).handler(async (): Promise<Aviso[]> => {
  const db = await getAdmin();
  const now = new Date().toISOString();
  const { data } = await db.from("avisos").select("*")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(mapAviso);
});

export const listProgramAudios = createServerFn({ method: "GET" }).handler(async (): Promise<Audio[]> => {
  const db = await getAdmin();
  const { data } = await db.from("program_audios").select("*")
    .eq("published", true)
    .order("program_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(60);
  return (data ?? []).map(mapAudio);
});

// ---------- Team: everything, including unpublished drafts ----------
export const listAvisosForTeam = createServerFn({ method: "GET" }).handler(async (): Promise<Aviso[]> => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("avisos").select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map(mapAviso);
});

export const listAudiosForTeam = createServerFn({ method: "GET" }).handler(async (): Promise<Audio[]> => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("program_audios").select("*")
    .order("program_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map(mapAudio);
});

// ---------- Owner: manage avisos ----------
const avisoInput = z.object({
  title: z.string().trim().min(2, "Escribe un título").max(120),
  body: z.string().trim().min(3, "Escribe el texto del aviso").max(4000),
  kind: z.enum(AVISO_KINDS).default("aviso"),
  pinned: z.boolean().default(false),
  published: z.boolean().default(true),
  publishAt: isoOrNull,
  expiresAt: isoOrNull,
});

export const ownerSaveAviso = createServerFn({ method: "POST" })
  .inputValidator((d: { id?: number } & z.input<typeof avisoInput>) => {
    const parsed = avisoInput.parse(d);
    return { ...parsed, id: typeof d.id === "number" && d.id > 0 ? d.id : null };
  })
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    const row = {
      title: data.title, body: data.body, kind: data.kind, pinned: data.pinned, published: data.published,
      publish_at: data.publishAt ?? null, expires_at: data.expiresAt ?? null, updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await db.from("avisos").update(row).eq("id", data.id);
      if (error) throw new Error("No se pudo guardar el aviso.");
      return { id: data.id };
    }
    const { data: created, error } = await db.from("avisos").insert(row).select("id").single();
    if (error || !created) throw new Error("No se pudo crear el aviso.");
    return { id: created.id as number };
  });

export const ownerDeleteAviso = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    await db.from("avisos").delete().eq("id", data.id);
    return { ok: true };
  });

// ---------- Owner: manage audios of past programs ----------
const audioInput = z.object({
  title: z.string().trim().min(2, "Escribe un título").max(120),
  programDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida").nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  audioUrl: httpsUrl,
  durationSeconds: z.number().int().min(1).max(36000).nullable().optional(),
  published: z.boolean().default(true),
});

export const ownerSaveAudio = createServerFn({ method: "POST" })
  .inputValidator((d: { id?: number } & z.input<typeof audioInput>) => {
    const parsed = audioInput.parse(d);
    return { ...parsed, id: typeof d.id === "number" && d.id > 0 ? d.id : null };
  })
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    const row = {
      title: data.title, program_date: data.programDate ?? null, description: data.description || null,
      audio_url: data.audioUrl, duration_seconds: data.durationSeconds ?? null, published: data.published,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await db.from("program_audios").update(row).eq("id", data.id);
      if (error) throw new Error("No se pudo guardar el audio.");
      return { id: data.id };
    }
    const { data: created, error } = await db.from("program_audios").insert(row).select("id").single();
    if (error || !created) throw new Error("No se pudo crear el audio.");
    return { id: created.id as number };
  });

export const ownerDeleteAudio = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number }) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    await db.from("program_audios").delete().eq("id", data.id);
    return { ok: true };
  });
