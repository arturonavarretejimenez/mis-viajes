import { NextResponse } from "next/server";
import { isOwner } from "@/lib/session";
import { describeKey, readClients } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * TEMPORAL. Solo para el propietario. No devuelve ninguna clave: únicamente
 * dice si están puestas, en qué formato y qué contesta Supabase con cada una.
 * Se borra en cuanto quede claro el fallo.
 */
export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  }

  const claves = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    servicio: describeKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    publica: describeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  const pruebas: Record<string, unknown> = {};

  let candidatos: ReturnType<typeof readClients> = [];
  try {
    candidatos = readClients();
  } catch (e) {
    return NextResponse.json({
      claves,
      error: (e as Error).message,
    });
  }

  for (const { nombre, cliente } of candidatos) {
    try {
      const { data, error } = await cliente
        .from("albums")
        .select("id, name, slug")
        .limit(5);
      pruebas[nombre] = error
        ? { ok: false, error: error.message, code: error.code }
        : { ok: true, filas: data?.length ?? 0, muestra: data };
    } catch (e) {
      pruebas[nombre] = { ok: false, excepcion: (e as Error).message };
    }
  }

  return NextResponse.json({ claves, pruebas });
}
