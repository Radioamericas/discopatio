/**
 * Site lock.
 *
 * While SITE_LOCKED is true the whole public site is frozen behind a
 * "próximamente" screen. Team and admin paths stay reachable so the team can
 * keep working; flip SITE_LOCKED back to false to reopen the site.
 */
export const SITE_LOCKED = true;

/** Where visitors are sent for more information. */
export const INFO_URL = "https://discopatio.lovable.app";

/** Paths that keep working while the site is locked. */
const TEAM_PATH_PREFIXES = ["/admin"];

export function isSiteLocked(pathname: string): boolean {
  if (!SITE_LOCKED) return false;
  const path = pathname.replace(/\/+$/, "") || "/";
  return !TEAM_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}
