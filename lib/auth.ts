export const SESSION_COOKIE = "viajes_sesion";

// Un año: quien entra una vez no vuelve a escribir la contraseña en ese móvil.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * `owner` es quien puede crear, subir y borrar. `visitor` solo mira.
 * El rol se decide por la contraseña con la que se entra.
 */
export type Role = "owner" | "visitor";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function passwordForRole(role: Role): string | undefined {
  return role === "owner"
    ? process.env.SITE_PASSWORD
    : process.env.VISITOR_PASSWORD;
}

/** Token que guardamos en la cookie para un rol, o null si no hay contraseña. */
export async function tokenForRole(role: Role): Promise<string | null> {
  const password = passwordForRole(role);
  if (!password) return null;
  return sha256Hex(`${role}:${password}::viajes-v2`);
}

/** Valor completo de la cookie: `rol.hash`. */
export async function cookieValueForRole(role: Role): Promise<string | null> {
  const token = await tokenForRole(role);
  return token ? `${role}.${token}` : null;
}

/**
 * Lee el rol de una cookie verificando su hash. Devuelve null si la cookie
 * falta, está manipulada o corresponde a una contraseña que ya cambió.
 */
export async function roleFromCookie(
  value: string | undefined,
): Promise<Role | null> {
  if (!value) return null;

  const separator = value.indexOf(".");
  if (separator < 1) return null;

  const claimed = value.slice(0, separator);
  const token = value.slice(separator + 1);

  if (claimed !== "owner" && claimed !== "visitor") return null;

  const expected = await tokenForRole(claimed);
  if (!expected) return null;

  return safeEqual(token, expected) ? claimed : null;
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
