"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { youtubeIdFromUrl, youtubeWatchUrl } from "@/lib/youtube";

export type FeaturedVideoState = {
  error: string | null;
  savedAt: number | null;
};

export async function setFeaturedVideo(
  _prevState: FeaturedVideoState,
  formData: FormData,
): Promise<FeaturedVideoState> {
  try {
    await requireOwner();
  } catch {
    return { error: "No tienes permiso para cambiar el vídeo.", savedAt: null };
  }

  const albumId = String(formData.get("album_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const raw = String(formData.get("url") ?? "").trim();

  if (!albumId || !slug) {
    return { error: "No se pudo identificar el álbum.", savedAt: null };
  }

  const supabase = createAdminClient();

  // Campo vacío = quitar el vídeo destacado.
  if (!raw) {
    const { error } = await supabase
      .from("albums")
      .update({ featured_video_url: null })
      .eq("id", albumId);

    if (error) {
      return { error: "No se pudo quitar el vídeo. Inténtalo de nuevo.", savedAt: null };
    }

    revalidatePath("/");
    revalidatePath(`/album/${slug}`);
    return { error: null, savedAt: Date.now() };
  }

  const videoId = youtubeIdFromUrl(raw);

  if (!videoId) {
    return {
      error:
        "Ese enlace no parece de YouTube. Pega la dirección del vídeo, tipo youtube.com/watch?v=… o youtu.be/…",
      savedAt: null,
    };
  }

  const { error } = await supabase
    .from("albums")
    .update({ featured_video_url: youtubeWatchUrl(videoId) })
    .eq("id", albumId);

  if (error) {
    return { error: "No se pudo guardar el vídeo. Inténtalo de nuevo.", savedAt: null };
  }

  revalidatePath("/");
  revalidatePath(`/album/${slug}`);
  return { error: null, savedAt: Date.now() };
}
