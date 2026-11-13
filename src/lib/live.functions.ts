import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAccess, getAdmin } from "@/lib/radio.server";

const SESSION_HOURS = 12;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function requireTeam() {
  if (!(await getAccess()).team) throw new Error("Necesitas entrar como equipo.");
}
async function requireOwner() {
  if (!(await getAccess()).owner) throw new Error("Solo el coordinador puede hacer esto.");
}
function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
const codeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8}$/);

async function openSession(code: string) {
  const db = await getAdmin();
  const { data } = await db.from("live_sessions").select("*").eq("code", code).maybeSingle();
  if (!data || data.closed_at || Date.parse(data.expires_at) < Date.now()) throw new Error("Este enlace ya no está activo.");
  return { db, session: data };
}

export type LiveSong = { id: number; songTitle: string; artist: string; course: string | null; dedication: string | null; sourceUrl: string | null; status: "pending" | "selected" | "played" | "rejected"; scheduledFor: "this_week" | "next_week" | null; createdAt: string };
const mapSong = (r: any): LiveSong => ({ id: r.id, songTitle: r.song_title, artist: r.artist, course: r.course, dedication: r.dedication, sourceUrl: r.source_url, status: r.status, scheduledFor: r.scheduled_for, createdAt: r.created_at });

// ---------- Team: create / list / close links ----------
export const createLiveSession = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string }) => z.object({ title: z.string().trim().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    await requireTeam();
    const db = await getAdmin();
    const code = newCode();
    const { error } = await db.from("live_sessions").insert({ code, title: data.title, expires_at: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString() });
    if (error) throw new Error("No se pudo crear el enlace.");
    return { code };
  });

export const listLiveSessions = createServerFn({ method: "GET" }).handler(async () => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("live_sessions").select("*").order("created_at", { ascending: false }).limit(10);
  return (data ?? []).map(s => ({ code: s.code, title: s.title, createdAt: s.created_at, active: !s.closed_at && Date.parse(s.expires_at) > Date.now() }));
});

export const closeLiveSession = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: codeSchema }).parse(d))
  .handler(async ({ data }) => {
    await requireTeam();
    const db = await getAdmin();
    await db.from("live_sessions").update({ closed_at: new Date().toISOString() }).eq("code", data.code);
    return { ok: true };
  });

// ---------- Link holders: view and mark songs ----------
export const getLiveSession = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => z.object({ code: codeSchema }).parse(d))
  .handler(async ({ data }) => {
    const { db, session } = await openSession(data.code);
    const { data: rows } = await db.from("song_requests").select("*").in("status", ["pending", "selected"]).order("created_at", { ascending: true }).limit(200);
    return { title: session.title, expiresAt: session.expires_at, songs: (rows ?? []).map(mapSong) };
  });

export const markLiveSong = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; id: number; action: "this_week" | "next_week" | "reject" | "played" | "clear" }) =>
    z.object({ code: codeSchema, id: z.number().int().positive(), action: z.enum(["this_week", "next_week", "reject", "played", "clear"]) }).parse(d))
  .handler(async ({ data }) => {
    const { db } = await openSession(data.code);
    const now = new Date().toISOString();
    const patch =
      data.action === "this_week" ? { status: "selected" as const, scheduled_for: "this_week" } :
      data.action === "next_week" ? { status: "selected" as const, scheduled_for: "next_week" } :
      data.action === "reject" ? { status: "rejected" as const, scheduled_for: null } :
      data.action === "played" ? { status: "played" as const, scheduled_for: null, played_at: now } :
      { status: "pending" as const, scheduled_for: null };
    await db.from("song_requests").update({ ...patch, updated_at: now }).eq("id", data.id).in("status", ["pending", "selected"]);
    return { ok: true };
  });

// ---------- Archive of played songs ----------
export const listArchive = createServerFn({ method: "GET" }).handler(async () => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("song_requests").select("*").eq("status", "played").order("played_at", { ascending: false, nullsFirst: false }).limit(500);
  return (data ?? []).map(r => ({ ...mapSong(r), playedAt: r.played_at ?? r.updated_at }));
});

// ---------- Help messages to the coordinator ----------
export const sendHelpMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { name?: string; contact?: string; message: string; page?: string }) => z.object({
    name: z.string().trim().max(80).optional(), contact: z.string().trim().max(120).optional(),
    message: z.string().trim().min(5, "Cuéntanos un poco más").max(1000), page: z.string().trim().max(200).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const db = await getAdmin();
    const { count } = await db.from("help_messages").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 600_000).toISOString());
    if ((count ?? 0) >= 20) throw new Error("Hay muchos mensajes ahora mismo. Prueba en unos minutos.");
    await db.from("help_messages").insert({ name: data.name || null, contact: data.contact || null, message: data.message, page: data.page || null });
    return { ok: true };
  });

export const listHelpMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireOwner();
  const db = await getAdmin();
  const { data } = await db.from("help_messages").select("*").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map(m => ({ id: m.id, name: m.name, contact: m.contact, message: m.message, page: m.page, createdAt: m.created_at, resolved: m.resolved }));
});

export const resolveHelpMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; resolved: boolean }) => z.object({ id: z.number().int().positive(), resolved: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    await db.from("help_messages").update({ resolved: data.resolved }).eq("id", data.id);
    return { ok: true };
  });
