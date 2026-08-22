import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * NUNCA importar esto desde un componente cliente. Solo desde Server
 * Components, Server Actions o Route Handlers. La clave de servicio vive en
 * `SUPABASE_SERVICE_ROLE_KEY`, que no lleva `NEXT_PUBLIC_` y por tanto nunca
 * llega al navegador.
 */

function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  }
  return url;
}

function build(key: string) {
  return createSupabaseClient(supabaseUrl(), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Cliente para ESCRIBIR. Con la clave de servicio se salta las políticas RLS.
 *
 * Si esa clave no está puesta, cae a la clave pública: no concede nada extra,
 * porque entonces manda la RLS. Mientras la base esté abierta funciona igual;
 * en cuanto se cierre, fallará con un error claro en vez de silencio.
 */
export function createAdminClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "No hay ninguna clave de Supabase configurada (ni de servicio ni pública).",
    );
  }
  return build(key);
}

export type ClienteCandidato = {
  nombre: "servicio" | "publica";
  cliente: ReturnType<typeof build>;
};

/**
 * Clientes de LECTURA por orden de preferencia.
 *
 * Primero la clave de servicio. Si no está, o si la petición falla con ella,
 * se reintenta con la clave pública. Así un problema con la clave de servicio
 * no deja la web en blanco: como mucho se lee lo que permita la RLS.
 */
export function readClients(): ClienteCandidato[] {
  const out: ClienteCandidato[] = [];

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    out.push({ nombre: "servicio", cliente: build(serviceKey) });
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    out.push({ nombre: "publica", cliente: build(anonKey) });
  }

  if (out.length === 0) {
    throw new Error(
      "No hay ninguna clave de Supabase configurada (ni de servicio ni pública).",
    );
  }

  return out;
}

/** Descripción de una clave SIN revelarla: formato y longitud. */
export function describeKey(value: string | undefined) {
  if (!value) return { presente: false as const };
  const formato = value.startsWith("sb_secret_")
    ? "sb_secret"
    : value.startsWith("sb_publishable_")
      ? "sb_publishable"
      : value.startsWith("eyJ")
        ? "jwt"
        : "desconocido";
  return {
    presente: true as const,
    formato,
    longitud: value.length,
    espaciosOSaltos: /\s/.test(value),
  };
}
