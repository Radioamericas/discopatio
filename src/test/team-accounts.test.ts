import { describe, expect, it } from "vitest";
import { accountPassword, requireAccountOwner, teamEmail, usernameInput } from "@/lib/team-accounts";

describe("cuentas privadas del equipo", () => {
  it("solo el propietario puede crear y restablecer cuentas", () => {
    expect(() => requireAccountOwner(false)).toThrow();
    expect(() => requireAccountOwner(true)).not.toThrow();
  });
  it("usa solo un nombre normalizado sin correo real", () => {
    expect(teamEmail("  Iker_2 ")).toBe("iker_2@team.discopatio.invalid");
    expect(usernameInput.safeParse("persona@example.com").success).toBe(false);
    expect(usernameInput.safeParse("dos nombres").success).toBe(false);
  });
  it("no acepta contraseñas menores de ocho caracteres", () => {
    expect(accountPassword.safeParse("1234567").success).toBe(false);
    expect(accountPassword.safeParse("abcdefgh").success).toBe(true);
  });
});