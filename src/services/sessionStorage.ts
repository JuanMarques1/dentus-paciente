import type { Session } from "./types";
export const rememberedSessionKey = `dentus:session:${import.meta.env.VITE_API_MODE ?? "demo"}:${import.meta.env.VITE_API_BASE_URL ?? ""}`;
export const demoAuthKey = "dentus:demo-auth";
export function readRememberedSession(): Session | null {
  try {
    const value = JSON.parse(
      localStorage.getItem(rememberedSessionKey) ?? "null",
    );
    if (
      value?.expiresAt > Date.now() &&
      typeof value.session?.token === "string" &&
      value.session.token &&
      typeof value.session.mustChangePassword === "boolean"
    )
      return value.session;
  } catch {
    /* Storage may be unavailable. */
  }
  clearRememberedSession();
  return null;
}
export function saveRememberedSession(
  session: Session,
  remember: boolean,
): void {
  try {
    if (remember)
      localStorage.setItem(
        rememberedSessionKey,
        JSON.stringify({ session, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }),
      );
    else clearRememberedSession();
  } catch {
    /* Login still works without storage. */
  }
}
export function clearRememberedSession(): void {
  try {
    localStorage.removeItem(rememberedSessionKey);
    localStorage.removeItem(demoAuthKey);
  } catch {
    /* Storage may be unavailable. */
  }
}
