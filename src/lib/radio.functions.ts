import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isLikelyExplicitSong, TERMS_VERSION } from "@/lib/content-moderation";
import { deviceCanSend, deviceWeekStart, IP_WEEK_MULTIPLIER } from "@/lib/device-limit";
import { FIRST_OPEN_AT, REQUEST_LIMIT, nextUnlockAt, windowStart } from "@/lib/schedule";
import {
  getAccess, getActivityMetadata, getAdmin, getDeviceId, getIpWeekHash, getCountry, hasPublicSession, isOwnerRequest, isTeamCode,
  LEGACY_SINGLE_USE_CODE, PUBLIC_ACCESS_CODE, publicSession, teamSession,
} from "@/lib/radio.server";

// Requests kept in the database but hidden from the team list (from the original app).
const HIDDEN_REQUEST_IDS = [1, 30001, 240001, 270001];

type Control = {
  id: number; blocked: boolean; openOverride: boolean; unlockAt: string | null; bannerEnabled: boolean;
  bannerText: string | null; bannerPosition: "top" | "middle" | "bottom"; bannerColor: string; updatedAt: string;
  siteLocked: boolean; lockNote: string | null; lockReopenAt: string | null;
  popupEnabled: boolean; popupTitle: string | null; popupText: string | null; popupImageUrl: string | null;
  perDeviceLimit: number; altOpen: boolean;
};

async function readControl(): Promise<Control> {
  const db = await getAdmin();
  const { data } = await db.from("site_control").select("*").eq("id", 1).maybeSingle();
  const r = data ?? { id: 1, blocked: false, open_override: false, unlock_at: null, banner_enabled: false, banner_text: null, banner_position: "top" as const, banner_color: "cyan", updated_at: new Date().toISOString(), site_locked: false, lock_note: null, lock_reopen_at: null as string | null, popup_enabled: false, popup_title: null, popup_text: null, popup_image_url: null, per_device_limit: 2, alt_open: true };
  return { id: r.id, blocked: r.blocked, openOverride: r.open_override, unlockAt: r.unlock_at, bannerEnabled: r.banner_enabled, bannerText: r.banner_text, bannerPosition: r.banner_position, bannerColor: r.banner_color, updatedAt: r.updated_at, siteLocked: r.site_locked && !(r.lock_reopen_at && Date.parse(r.lock_reopen_at) <= Date.now()), lockNote: r.lock_note, lockReopenAt: r.lock_reopen_at, popupEnabled: r.popup_enabled, popupTitle: r.popup_title, popupText: r.popup_text, popupImageUrl: r.popup_image_url, perDeviceLimit: r.per_device_limit, altOpen: r.alt_open };
}

async function deviceUsage() {
  const db = await getAdmin();
  const deviceId = await getDeviceId();
  const since = deviceWeekStart();
  const ipWeekHash = await getIpWeekHash(since);
  const sinceIso = new Date(since).toISOString();
  const [{ count: used }, { count: ipUsed }, { data: blocked }] = await Promise.all([
    db.from("request_activity").select("request_id", { count: "exact", head: true }).eq("device_id", deviceId).gte("created_at", sinceIso),
    db.from("request_activity").select("request_id", { count: "exact", head: true }).eq("ip_week_hash", ipWeekHash).gte("created_at", sinceIso),
    db.from("blocked_devices").select("device_id").eq("device_id", deviceId).maybeSingle(),
  ]);
  return { deviceId, ipWeekHash, used: used ?? 0, ipUsed: ipUsed ?? 0, blocked: Boolean(blocked) };
}

export const getDeviceStatus = createServerFn({ method: "GET" }).handler(async () => {
  const [c, u] = await Promise.all([readControl(), deviceUsage()]);
  return { used: u.used, limit: c.perDeviceLimit, blocked: u.blocked, altOpen: c.altOpen, canSend: !u.blocked && deviceCanSend(u.used, c.perDeviceLimit) };
});

async function pauseState() {
  const now = Date.now();
  const control = await readControl();
  let count = 0;
  if (now >= FIRST_OPEN_AT) {
    const db = await getAdmin();
    const { count: c } = await db.from("song_requests").select("id", { count: "exact", head: true }).gte("created_at", new Date(windowStart(now)).toISOString());
    count = c ?? 0;
  }
  if (control.openOverride && !control.blocked) return { paused: false, count, limit: REQUEST_LIMIT, unlockAt: null as number | null, control };
  const paused = now < FIRST_OPEN_AT || count >= REQUEST_LIMIT;
  return { paused, count, limit: REQUEST_LIMIT, unlockAt: paused ? nextUnlockAt(now) : null, control };
}

async function requireTeam() {
  const { team } = await getAccess();
  if (!team) throw new Error("Necesitas el código privado de acceso.");
}
async function requireOwner() {
  if (!(await isOwnerRequest())) throw new Error("Necesitas iniciar sesión con la cuenta propietaria.");
}

// ---------- Access ----------
export const getSessionInfo = createServerFn({ method: "GET" }).handler(async () => {
  const access = await getAccess();
  return { owner: access.owner, team: access.team, publicGranted: true };
});

export const publicLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().trim().min(1).max(32) }).parse(d))
  .handler(async ({ data }) => {
    if (data.code.toUpperCase() !== PUBLIC_ACCESS_CODE) throw new Error("Código público incorrecto.");
    const s = await publicSession();
    await s.update({ granted: true });
    return { success: true };
  });

export const teamLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().trim().regex(/^[A-Z0-9]{16,21}$/i, "Código incorrecto") }).parse(d))
  .handler(async ({ data }) => {
    if (!isTeamCode(data.code)) throw new Error("Código incorrecto");
    const s = await teamSession();
    await s.update({ team: true });
    return { success: true };
  });

export const teamLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await teamSession();
  await s.clear();
  return { success: true };
});

// ---------- Public ----------
export const getRequestStatus = createServerFn({ method: "GET" }).handler(async () => {
  const p = await pauseState();
  const c = p.control;
  return {
    paused: p.paused, count: p.count, limit: p.limit,
    blocked: c.blocked, openOverride: c.openOverride, bannerEnabled: c.bannerEnabled, bannerText: c.bannerText,
    bannerPosition: c.bannerPosition, bannerColor: c.bannerColor,
    siteLocked: c.siteLocked, lockNote: c.lockNote, lockReopenAt: c.lockReopenAt ? new Date(c.lockReopenAt).getTime() : null,
    popupEnabled: c.popupEnabled, popupTitle: c.popupTitle, popupText: c.popupText, popupImageUrl: c.popupImageUrl, updatedAt: c.updatedAt,
    unlockAt: c.unlockAt ? new Date(c.unlockAt).getTime() : p.unlockAt,
  };
});

export const heartbeat = createServerFn({ method: "POST" })
  .inputValidator((d: { sessionId: string }) => z.object({ sessionId: z.string().regex(/^[a-zA-Z0-9_-]{16,64}$/) }).parse(d))
  .handler(async ({ data }) => {
    const db = await getAdmin();
    const meta = await getActivityMetadata();
    await db.from("active_visitors").delete().lt("last_seen", new Date(Date.now() - 3600_000).toISOString());
    await db.from("active_visitors").upsert({ session_id: data.sessionId, ...meta, last_seen: new Date().toISOString() });
    return { ok: true };
  });

const analyticsInput = z.object({
  page: z.string().trim().regex(/^\/[a-zA-Z0-9_\-./]{0,200}$/),
  eventType: z.enum(["page_view", "session_end", "click"]),
  durationSeconds: z.number().int().min(0).max(3600).default(0),
  clicks: z.number().int().min(0).max(100).default(0),
  deviceType: z.enum(["móvil", "tablet", "ordenador", "desconocido"]).default("desconocido"),
});
export const recordAnalytics = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof analyticsInput>) => analyticsInput.parse(d))
  .handler(async ({ data }) => {
    const db = await getAdmin();
    await db.from("analytics_events").insert({
      day: new Date().toISOString().slice(0, 10), page: data.page, event_type: data.eventType,
      duration_seconds: data.durationSeconds, clicks: data.clicks, device_type: data.deviceType, country: getCountry(),
    });
    return { ok: true };
  });

export type Track = { id: string; title: string; artist: string; album: string; year?: number | undefined; previewUrl?: string | undefined; artworkUrl?: string | undefined; sourceUrl?: string | undefined; explicitness: "explicit" | "cleaned" | "notExplicit" | "unknown" };

export const searchMusic = createServerFn({ method: "GET" })
  .inputValidator((d: { query: string }) => z.object({ query: z.string().trim().min(2).max(100) }).parse(d))
  .handler(async ({ data }): Promise<Track[]> => {
    // Deezer (free, no key) first; iTunes as fallback.
    try {
      const dz = await fetch(`https://api.deezer.com/search?limit=8&q=${encodeURIComponent(data.query)}`);
      if (dz.ok) {
        const j = (await dz.json()) as { data?: Array<{ id: number; title: string; explicit_lyrics?: boolean; link?: string; preview?: string; artist?: { name?: string }; album?: { title?: string; cover_medium?: string } }> };
        if (j.data?.length) return j.data.map((t) => ({
          id: `dz-${t.id}`, title: t.title, artist: t.artist?.name ?? "Artista desconocido", album: t.album?.title ?? "",
          previewUrl: t.preview || undefined, artworkUrl: t.album?.cover_medium, sourceUrl: t.link,
          explicitness: t.explicit_lyrics ? "explicit" : "notExplicit",
        }));
      }
    } catch { /* fall back */ }
    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", data.query);
    url.searchParams.set("entity", "song");
    url.searchParams.set("country", "ES");
    url.searchParams.set("limit", "8");
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo consultar el buscador musical. Prueba de nuevo.");
    const json = (await response.json()) as { results?: Array<{ trackId?: number; trackName?: string; artistName?: string; collectionName?: string; releaseDate?: string; previewUrl?: string; trackViewUrl?: string; artworkUrl100?: string; trackExplicitness?: Track["explicitness"] }> };
    return (json.results ?? []).map((t) => ({
      id: String(t.trackId ?? `${t.artistName}-${t.trackName}`),
      title: t.trackName ?? "Sin título",
      artist: t.artistName ?? "Artista desconocido",
      album: t.collectionName ?? "",
      year: t.releaseDate ? Number(t.releaseDate.slice(0, 4)) || undefined : undefined,
      previewUrl: t.previewUrl,
      artworkUrl: t.artworkUrl100?.replace("100x100", "300x300"),
      sourceUrl: t.trackViewUrl,
      explicitness: t.trackExplicitness ?? "unknown",
    }));
  });

export const checkAccessCode = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().trim().regex(/^[A-Z0-9]{6,21}$/i) }).parse(d))
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    if (isTeamCode(code)) return { valid: true, permanent: true };
    const db = await getAdmin();
    if (code === LEGACY_SINGLE_USE_CODE) {
      const { data: row } = await db.from("access_codes").select("code").eq("code", code).is("used_at", null).maybeSingle();
      return { valid: Boolean(row), permanent: false };
    }
    const { data: row } = await db.from("student_access_codes").select("code").eq("code", code).is("used_at", null).maybeSingle();
    return { valid: Boolean(row), permanent: false };
  });

const requestInput = z.object({
  songTitle: z.string().trim().min(1).max(255),
  artist: z.string().trim().min(1).max(255),
  album: z.string().trim().max(255).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  requesterName: z.string().trim().min(1, "El nombre del alumno es obligatorio").max(120),
  course: z.string().trim().min(1, "El curso es obligatorio").max(80),
  dedication: z.string().trim().max(1000).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  termsAccepted: z.literal(true),
  termsVersion: z.literal(TERMS_VERSION),
  explicitWarningAccepted: z.boolean().default(false),
  accessCode: z.string().trim().regex(/^[A-Z0-9]{6,21}$/i, "El código no tiene un formato válido").optional(),
  alt: z.boolean().optional(),
});

export const createSongRequest = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof requestInput>) => requestInput.parse(d))
  .handler(async ({ data }) => {
    const access = await getAccess();
    if (isLikelyExplicitSong(data.songTitle, data.artist) && !data.explicitWarningAccepted) throw new Error("Esta canción parece contener contenido explícito. Confirma que quieres enviarla.");
    const pause = await pauseState();
    const code = data.accessCode?.toUpperCase();
    const permanentBypass = code ? isTeamCode(code) : false;
    const db = await getAdmin();
    const lockedNow = Boolean(pause.control.siteLocked);
    const usage = await deviceUsage();
    if (!permanentBypass) {
      if (usage.blocked) throw new Error("Este dispositivo está bloqueado por uso indebido del buzón.");
      const limit = pause.control.perDeviceLimit;
      if (!deviceCanSend(usage.used, limit)) throw new Error(`Ya has enviado ${limit} ${limit === 1 ? "canción" : "canciones"} esta semana. Vuelve el jueves.`);
      if (!deviceCanSend(usage.ipUsed, limit * IP_WEEK_MULTIPLIER)) throw new Error("Se han enviado demasiadas canciones desde esta conexión esta semana.");
    }
    const altBypass = data.alt === true && pause.control.altOpen;
    if ((pause.paused || pause.control.blocked || lockedNow) && !permanentBypass && !altBypass) {
      if (!code) throw new Error("La página está bloqueada. Utiliza un código válido de un solo uso.");
      const fn = code.length === 6 ? "redeem_student_access_code" : "redeem_access_code";
      const { data: redeemed } = await db.rpc(fn, { _code: code });
      if (!redeemed) throw new Error("Código no válido o ya utilizado.");
    }
    const { data: row, error } = await db.from("song_requests").insert({
      song_title: data.songTitle, artist: data.artist, album: data.album ?? null, year: data.year ?? null,
      requester_name: data.requesterName, course: data.course, dedication: data.dedication ?? null,
      source_url: data.sourceUrl ?? null, terms_accepted: true, terms_version: data.termsVersion, status: "pending",
    }).select("id").single();
    if (error || !row) throw new Error("No se pudo guardar la petición.");
    await db.from("request_activity").insert({ request_id: row.id, ...(await getActivityMetadata()), access_code_used: Boolean(code), device_id: usage.deviceId, ip_week_hash: usage.ipWeekHash });
    return { success: true, id: row.id };
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: { requestId: number; rating: number }) => z.object({ requestId: z.number().int().positive(), rating: z.number().int().min(1).max(5) }).parse(d))
  .handler(async ({ data }) => {
    const db = await getAdmin();
    await db.from("site_feedback").insert({ request_id: data.requestId, rating: data.rating });
    return { success: true };
  });

// ---------- Team ----------
export type RequestItem = { id: number; songTitle: string; artist: string; album: string | null; year: number | null; requesterName: string | null; course: string | null; dedication: string | null; sourceUrl: string | null; notes: string | null; status: "pending" | "selected" | "played" | "rejected"; createdAt: string };

export const adminListRequests = createServerFn({ method: "GET" }).handler(async (): Promise<RequestItem[]> => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("song_requests").select("*").not("id", "in", `(${HIDDEN_REQUEST_IDS.join(",")})`).order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({ id: r.id, songTitle: r.song_title, artist: r.artist, album: r.album, year: r.year, requesterName: r.requester_name, course: r.course, dedication: r.dedication, sourceUrl: r.source_url, notes: r.notes, status: r.status, createdAt: r.created_at }));
});

export const updateRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; status: RequestItem["status"]; notes?: string | undefined }) => z.object({ id: z.number().int(), status: z.enum(["pending", "selected", "played", "rejected"]), notes: z.string().max(1000).optional() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeam();
    const db = await getAdmin();
    const now = new Date().toISOString();
    await db.from("song_requests").update({ status: data.status, notes: data.notes ?? null, updated_at: now, ...(data.status === "played" ? { played_at: now, scheduled_for: null } : data.status !== "selected" ? { scheduled_for: null } : {}) }).eq("id", data.id);
    return { success: true };
  });

export const adminListFeedback = createServerFn({ method: "GET" }).handler(async () => {
  await requireTeam();
  const db = await getAdmin();
  const { data } = await db.from("site_feedback").select("*").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map((r) => ({ id: r.id, requestId: r.request_id, rating: r.rating, createdAt: r.created_at }));
});

export const adminLiveActivity = createServerFn({ method: "GET" }).handler(async () => {
  await requireTeam();
  const db = await getAdmin();
  await db.from("active_visitors").delete().lt("last_seen", new Date(Date.now() - 3600_000).toISOString());
  const { data: visitors } = await db.from("active_visitors").select("*").gte("last_seen", new Date(Date.now() - 120_000).toISOString()).order("last_seen", { ascending: false });
  const { data: acts } = await db.from("request_activity").select("*").order("request_id", { ascending: false }).limit(50);
  const ids = (acts ?? []).map((a) => a.request_id);
  const { data: reqs } = ids.length ? await db.from("song_requests").select("id, song_title, artist, requester_name, course, created_at").in("id", ids) : { data: [] };
  const byId = new Map((reqs ?? []).map((r) => [r.id, r]));
  const requests = (acts ?? []).filter((a) => byId.has(a.request_id)).map((a) => {
    const r = byId.get(a.request_id)!;
    return { requestId: a.request_id, songTitle: r.song_title, artist: r.artist, requesterName: r.requester_name, course: r.course, createdAt: r.created_at, ipHash: a.ip_hash, deviceType: a.device_type, browser: a.browser, accessCodeUsed: a.access_code_used };
  }).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  return { visitors: (visitors ?? []).map((v) => ({ sessionId: v.session_id, ipHash: v.ip_hash, deviceType: v.device_type, browser: v.browser })), requests };
});

// ---------- Owner ----------
export const deleteRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { id: number; confirmation: "ELIMINAR" }) => z.object({ id: z.number().int().positive(), confirmation: z.literal("ELIMINAR") }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    await db.from("song_requests").delete().eq("id", data.id);
    return { success: true };
  });

export const ownerGetControl = createServerFn({ method: "GET" }).handler(async () => {
  await requireOwner();
  return readControl();
});

const controlInput = z.object({
  blocked: z.boolean().optional(), openOverride: z.boolean().optional(), unlockAt: z.string().datetime().nullable().optional(),
  bannerEnabled: z.boolean().optional(), bannerText: z.string().max(500).nullable().optional(),
  bannerPosition: z.enum(["top", "middle", "bottom"]).optional(), bannerColor: z.string().max(24).optional(),
  siteLocked: z.boolean().optional(), lockNote: z.string().trim().max(500).nullable().optional(), lockReopenAt: z.string().datetime().nullable().optional(),
  popupEnabled: z.boolean().optional(), popupTitle: z.string().trim().max(120).nullable().optional(),
  popupText: z.string().trim().max(1000).nullable().optional(),
  perDeviceLimit: z.number().int().min(1).max(20).optional(), altOpen: z.boolean().optional(),
  popupImageUrl: z.string().max(700_000).regex(/^(data:image\/(jpeg|png|webp);base64,|https:\/\/)/).nullable().optional(),
});
export const ownerUpdateControl = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof controlInput>) => controlInput.parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    const patch = {
      id: 1, updated_at: new Date().toISOString(),
      ...(data.blocked !== undefined && { blocked: data.blocked }),
      ...(data.openOverride !== undefined && { open_override: data.openOverride }),
      ...(data.unlockAt !== undefined && { unlock_at: data.unlockAt }),
      ...(data.bannerEnabled !== undefined && { banner_enabled: data.bannerEnabled }),
      ...(data.bannerText !== undefined && { banner_text: data.bannerText }),
      ...(data.bannerPosition !== undefined && { banner_position: data.bannerPosition }),
      ...(data.bannerColor !== undefined && { banner_color: data.bannerColor }),
      ...(data.siteLocked !== undefined && { site_locked: data.siteLocked }),
      ...(data.lockNote !== undefined && { lock_note: data.lockNote || null }),
      ...(data.lockReopenAt !== undefined && { lock_reopen_at: data.lockReopenAt }),
      ...(data.popupEnabled !== undefined && { popup_enabled: data.popupEnabled }),
      ...(data.popupTitle !== undefined && { popup_title: data.popupTitle || null }),
      ...(data.popupText !== undefined && { popup_text: data.popupText || null }),
      ...(data.popupImageUrl !== undefined && { popup_image_url: data.popupImageUrl || null }),
      ...(data.perDeviceLimit !== undefined && { per_device_limit: data.perDeviceLimit }),
      ...(data.altOpen !== undefined && { alt_open: data.altOpen }),
    };
    await db.from("site_control").upsert(patch);
    return readControl();
  });

export const ownerListCodes = createServerFn({ method: "GET" }).handler(async () => {
  await requireOwner();
  const db = await getAdmin();
  const { data } = await db.from("student_access_codes").select("*").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map((r) => ({ code: r.code, studentName: r.student_name, usedAt: r.used_at }));
});

export const ownerCreateCode = createServerFn({ method: "POST" })
  .inputValidator((d: { studentName: string }) => z.object({ studentName: z.string().trim().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await db.from("student_access_codes").insert({ code, student_name: data.studentName });
    if (error) throw new Error("No se pudo generar el código.");
    return { code, studentName: data.studentName };
  });

export const ownerAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  await requireOwner();
  const db = await getAdmin();
  await db.from("analytics_events").delete().lt("created_at", new Date(Date.now() - 25 * 30 * 86400_000).toISOString());
  const { data } = await db.rpc("analytics_summary");
  return (data ?? []).map((r) => ({ day: r.day, page: r.page, eventType: r.event_type, views: Number(r.views), totalSeconds: Number(r.total_seconds), clicks: Number(r.clicks), country: r.country, deviceType: r.device_type }));
});

// ---------- Devices (team view, owner blocks) ----------
export const teamListDevices = createServerFn({ method: "GET" }).handler(async () => {
  await requireTeam();
  const db = await getAdmin();
  const since = new Date(deviceWeekStart()).toISOString();
  const [{ data: acts }, { data: blocked }] = await Promise.all([
    db.from("request_activity").select("device_id, device_type, browser, created_at").not("device_id", "is", null).gte("created_at", since).limit(2000),
    db.from("blocked_devices").select("device_id"),
  ]);
  const blockedSet = new Set((blocked ?? []).map((b) => b.device_id));
  const map = new Map<string, { deviceId: string; count: number; deviceType: string | null; browser: string | null; last: string }>();
  for (const a of acts ?? []) {
    const id = a.device_id!;
    const cur = map.get(id) ?? { deviceId: id, count: 0, deviceType: a.device_type, browser: a.browser, last: a.created_at };
    cur.count += 1; if (a.created_at > cur.last) cur.last = a.created_at;
    map.set(id, cur);
  }
  for (const id of blockedSet) if (!map.has(id)) map.set(id, { deviceId: id, count: 0, deviceType: null, browser: null, last: "" });
  return [...map.values()].map((d) => ({ ...d, blocked: blockedSet.has(d.deviceId) })).sort((a, b) => b.count - a.count);
});

export const ownerSetDeviceBlocked = createServerFn({ method: "POST" })
  .inputValidator((d: { deviceId: string; blocked: boolean }) => z.object({ deviceId: z.string().uuid(), blocked: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    await requireOwner();
    const db = await getAdmin();
    if (data.blocked) await db.from("blocked_devices").upsert({ device_id: data.deviceId });
    else await db.from("blocked_devices").delete().eq("device_id", data.deviceId);
    return { success: true };
  });
