import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la clave de servicio: se salta las políticas RLS.
 *
 * NUNCA importar esto desde un componente cliente. Solo desde Server
 * Components, Server Actions o Route Handlers. La clave vive en
 * `SUPABASE_SERVICE_ROLE_KEY`, que no lleva `NEXT_PUBLIC_` y por tanto nunca
 * llega al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
