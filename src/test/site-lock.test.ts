import { describe, expect, it } from "vitest";

import { INFO_URL, isSiteLocked } from "@/lib/site-lock";

// The lock freezes the public site but must never lock the team out of their panel.
describe("Site lock", () => {
  it("keeps public pages frozen behind the coming-soon screen", () => {
    expect(isSiteLocked("/")).toBe(true);
    expect(isSiteLocked("/aviso-legal")).toBe(true);
    expect(isSiteLocked("/privacidad")).toBe(true);
    expect(isSiteLocked("/cookies")).toBe(true);
  });

  it("leaves the team and admin panel reachable", () => {
    expect(isSiteLocked("/admin")).toBe(false);
    expect(isSiteLocked("/admin/")).toBe(false);
  });

  it("points visitors at the site the user gave", () => {
    expect(INFO_URL).toBe("https://discopatio.lovable.app");
  });
});
