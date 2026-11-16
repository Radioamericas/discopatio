// Server-only helpers for Radio Patio: code-based sessions, owner check, request metadata.
import { createClient } from "@supabase/supabase-js";
import { getRequestHeader, useSession } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

// Team codes live only in the TEAM_ACCESS_CODES server secret (comma-separated), never in source.
function teamAccessCodes(): string[] {
  return (process.env["TEAM_ACCESS_CODES"] ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c.length >= 16);
}
export const LEGACY_SINGLE_USE_CODE = "NV4SXULY75CS1DABNGXD0";
export const PUBLIC_ACCESS_CODE = "JUEVES";

export function isTeamCode(value: string) {
  const v = value.trim().toUpperCase();
  return teamAccessCodes().some((c) => c === v);
}

function sessionConfig(name: string, maxAge: number) {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("SESSION_SECRET missing");
  return {
    password,
    name,
    maxAge,
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

export const teamSession = () =>
  useSession<{ team?: boolean }>(sessionConfig("disco_patio_team_session", 60 * 60 * 24 * 30));
export const publicSession = () =>
  useSession<{ granted?: boolean }>(sessionConfig("disco_patio_public_access", 60 * 60 * 24 * 365));

export const deviceSession = () =>
  useSession<{ id?: string }>(sessionConfig("disco_patio_device", 60 * 60 * 24 * 365));

/** Anonymous per-browser id kept in a signed cookie, created on first use. */
export async function getDeviceId() {
  const s = await deviceSession();
  if (s.data.id) return s.data.id;
  const id = crypto.randomUUID();
  await s.update({ id });
  return id;
}

/** IP hash salted per device-limit week (not per day), so a week can be counted. */
export async function getIpWeekHash(weekStart: number) {
  const ip = String(getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  return (await sha256Hex(`${process.env["SESSION_SECRET"] ?? "activity-salt"}|week|${weekStart}|${ip}`)).slice(0, 32);
}

export async function hasTeamSession() {
  const s = await teamSession();
  return s.data.team === true;
}
export async function hasPublicSession() {
  const s = await publicSession();
  return s.data.granted === true;
}

/** Returns true when the request carries a valid signed-in owner (admin role). */
async function accountAccess(): Promise<{ owner: boolean; team: boolean }> {
  const auth = getRequestHeader("authorization");
  if (!auth?.startsWith("Bearer ")) return { owner: false, team: false };
  const token = auth.slice(7);
  if (token.split(".").length !== 3) return { owner: false, team: false };
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return { owner: false, team: false };
  const { data: owner } = await client.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (owner === true) return { owner: true, team: true };
  const [{ data: role }, { data: profile }] = await Promise.all([
    client.rpc("has_role", { _user_id: data.user.id, _role: "user" }),
    client.from("profiles").select("id").eq("id", data.user.id).maybeSingle(),
  ]);
  return { owner: false, team: role === true && Boolean(profile) };
}

export async function isOwnerRequest(): Promise<boolean> {
  return (await accountAccess()).owner;
}

export async function getAccess() {
  const [account, team] = await Promise.all([accountAccess(), hasTeamSession()]);
  return { owner: account.owner, team: team || account.team };
}

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getActivityMetadata() {
  const ua = String(getRequestHeader("user-agent") ?? "").toLowerCase();
  const ip = String(getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const ipHash = (await sha256Hex(`${process.env["SESSION_SECRET"] ?? "activity-salt"}|${day}|${ip}`)).slice(0, 32);
  const deviceType = /tablet|ipad/.test(ua) ? "tablet" : /mobile|android|iphone/.test(ua) ? "móvil" : "ordenador";
  const browser = /edg\//.test(ua) ? "Edge" : /chrome\//.test(ua) ? "Chrome" : /firefox\//.test(ua) ? "Firefox" : /safari\//.test(ua) ? "Safari" : "Otro";
  return { ip_hash: ipHash, device_type: deviceType, browser };
}

export function getCountry() {
  const c = String(getRequestHeader("cf-ipcountry") ?? getRequestHeader("x-country-code") ?? "XX").toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : "XX";
}
