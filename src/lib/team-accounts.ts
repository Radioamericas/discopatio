import { z } from "zod";

export const usernameInput = z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,32}$/, "Usa de 3 a 32 letras, números o guion bajo, sin espacios.");
export const accountPassword = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(128);
export function teamEmail(username: string) {
  return `${usernameInput.parse(username)}@team.discopatio.invalid`;
}
export function requireAccountOwner(isOwner: boolean) {
  if (!isOwner) throw new Error("Solo el propietario puede gestionar cuentas.");
}