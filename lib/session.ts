// Solo servidor: importa `next/headers`, que ya revienta si alguien intenta
// usarlo desde un componente cliente.
import { cookies } from "next/headers";
import { SESSION_COOKIE, roleFromCookie, type Role } from "@/lib/auth";

/** Rol de quien está haciendo la petición, leído de la cookie. */
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return roleFromCookie(store.get(SESSION_COOKIE)?.value);
}

export async function isOwner(): Promise<boolean> {
  return (await getRole()) === "owner";
}

/**
 * Corta la ejecución si quien llama no es el propietario.
 * Se usa al principio de TODA acción que escriba: esconder el botón en la
 * interfaz no protege nada, la comprobación de verdad es esta.
 */
export async function requireOwner(): Promise<void> {
  if (!(await isOwner())) {
    throw new Error("No tienes permiso para hacer esto.");
  }
}
