import { readClients } from "@/lib/supabase/admin";
import type { Album, AlbumWithCount, Media } from "@/lib/types";

type Respuesta<T> = { data: T | null; error: unknown };

/**
 * Lanza la consulta con la clave de servicio y, si falla, la reintenta con la
 * clave pública. Si fallan todas, lanza el error de verdad en vez de devolver
 * una lista vacía: una web en blanco por un fallo silencioso parece que se han
 * borrado los datos, y eso no puede volver a pasar.
 */
async function leer<T>(
  consulta: (cliente: ReturnType<typeof readClients>[number]["cliente"]) => PromiseLike<Respuesta<T>>,
): Promise<T | null> {
  const candidatos = readClients();
  const fallos: string[] = [];

  for (const { nombre, cliente } of candidatos) {
    try {
      const { data, error } = await consulta(cliente);
      if (!error) return data;
      const mensaje =
        (error as { message?: string })?.message ?? JSON.stringify(error);
      fallos.push(`${nombre}: ${mensaje}`);
    } catch (e) {
      fallos.push(`${nombre}: ${(e as Error)?.message ?? String(e)}`);
    }
  }

  throw new Error(`Supabase no devolvió datos → ${fallos.join(" | ")}`);
}

export async function getAlbums(): Promise<AlbumWithCount[]> {
  const data = await leer((c) =>
    c.from("albums").select("*, media(count)").order("created_at", { ascending: false }),
  );

  if (!data) return [];

  return (data as unknown[]).map((row) => {
    const { media, ...album } = row as Record<string, unknown> & {
      media?: { count: number }[];
    };
    return {
      ...album,
      media_count: media?.[0]?.count ?? 0,
    };
  }) as AlbumWithCount[];
}

export async function getAlbumBySlug(slug: string) {
  const album = await leer((c) =>
    c.from("albums").select("*").eq("slug", slug).maybeSingle(),
  );

  if (!album) return null;

  const media = await leer((c) =>
    c
      .from("media")
      .select("*")
      .eq("album_id", (album as { id: string }).id)
      .order("created_at", { ascending: false }),
  );

  return {
    album: album as Album,
    media: (media ?? []) as Media[],
  };
}
