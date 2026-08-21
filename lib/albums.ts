import { createAdminClient } from "@/lib/supabase/admin";
import type { AlbumWithCount, Media } from "@/lib/types";

export async function getAlbums(): Promise<AlbumWithCount[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("albums")
      .select("*, media(count)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("[albums] getAlbums falló:", JSON.stringify(error));
      return [];
    }

    return data.map((row) => {
      const { media, ...album } = row as typeof row & {
        media: { count: number }[];
      };
      return {
        ...album,
        media_count: media?.[0]?.count ?? 0,
      };
    }) as AlbumWithCount[];
  } catch (e) {
    // Supabase sin configurar: degradar a lista vacía en vez de romper la home.
    console.error("[albums] getAlbums excepción:", (e as Error)?.message, {
      tieneUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      tieneClaveServicio: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      longitudClave: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").length,
    });
    return [];
  }
}

export async function getAlbumBySlug(slug: string) {
  try {
    const supabase = createAdminClient();

    const { data: album, error } = await supabase
      .from("albums")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !album) return null;

    const { data: media } = await supabase
      .from("media")
      .select("*")
      .eq("album_id", album.id)
      .order("created_at", { ascending: false });

    return { album, media: (media ?? []) as Media[] };
  } catch {
    return null;
  }
}
