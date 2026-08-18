export const SESSION_COOKIE = "viajes_sesion";

// Un año: quien entra una vez no vuelve a escribir la contraseña en ese móvil.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Valor que guardamos en la cookie: el hash de la contraseña del sitio.
 * Devuelve null si no hay `SITE_PASSWORD` configurada.
 */
export async function sessionToken(): Promise<string | null> {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return sha256Hex(`${password}::viajes-v1`);
}

/** Comparación en tiempo constante, para no filtrar información por timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Evita open redirects: solo aceptamos rutas internas. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
