import { describe, expect, it } from "vitest";
import { deviceCanSend, deviceWeekStart } from "@/lib/device-limit";

describe("límite por dispositivo", () => {
  it("con límite 2 deja enviar la 2.ª y no la 3.ª", () => {
    expect(deviceCanSend(1, 2)).toBe(true);
    expect(deviceCanSend(2, 2)).toBe(false);
  });
  it("la semana se reinicia el jueves a las 14:00 de Madrid", () => {
    const wed = Date.parse("2026-11-18T20:00:00Z");
    const thuAfter = Date.parse("2026-11-19T12:00:00Z");
    expect(deviceWeekStart(wed)).toBe(Date.parse("2026-11-12T12:00:00Z"));
    expect(deviceWeekStart(thuAfter)).toBe(thuAfter);
  });
});
