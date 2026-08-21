"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACCEPTED_MEDIA_TYPES,
  MEDIA_BUCKET,
  extensionFromMimeType,
  isVideoType,
} from "@/lib/storage";

/**
 * El navegador no puede escribir en el bucket (está cerrado), así que le damos
 * una URL de subida firmada de un solo uso. El archivo va directo del móvil a
 * Supabase sin pasar por el servidor, que es lo que permite vídeos de 50 MB.
 */
export async function createUploadTarget(albumId: string, mimeType: string) {
  await requireOwner();

  if (!ACCEPTED_MEDIA_TYPES.includes(mimeType)) {
    throw new Error("Tipo de archivo no permitido.");
  }

  const ext = extensionFromMimeType(mimeType);
  const path = `${albumId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("No se pudo preparar la subida.");
  }

  return { path: data.path, token: data.token };
}

export async function registerMedia(
  albumId: string,
  slug: string,
  storagePath: string,
  mimeType: string,
) {
  await requireOwner();

  const supabase = createAdminClient();

  const { error } = await supabase.from("media").insert({
    album_id: albumId,
    storage_path: storagePath,
    mime_type: mimeType,
  });

  if (error) {
    throw new Error("No se pudo guardar la foto.");
  }

  const { data: album } = await supabase
    .from("albums")
    .select("cover_path")
    .eq("id", albumId)
    .single();

  // La portada automática solo la ponemos con fotos: un vídeo como portada
  // queda peor en la rejilla. El usuario siempre puede elegirlo a mano.
  if (album && !album.cover_path && !isVideoType(mimeType)) {
    await supabase
      .from("albums")
      .update({ cover_path: storagePath })
      .eq("id", albumId);
  }

  revalidatePath("/");
  revalidatePath(`/album/${slug}`);
}

export async function setAlbumCover(
  albumId: string,
  storagePath: string,
  slug: string,
) {
  await requireOwner();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("albums")
    .update({ cover_path: storagePath })
    .eq("id", albumId);

  if (error) {
    throw new Error("No se pudo actualizar la portada.");
  }

  revalidatePath("/");
  revalidatePath(`/album/${slug}`);
}

export async function deleteMedia(
  mediaId: string,
  storagePath: string,
  albumId: string,
  slug: string,
) {
  await requireOwner();

  const supabase = createAdminClient();

  await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
  await supabase.from("media").delete().eq("id", mediaId);

  const { data: album } = await supabase
    .from("albums")
    .select("cover_path")
    .eq("id", albumId)
    .single();

  if (album && album.cover_path === storagePath) {
    const { data: nextMedia } = await supabase
      .from("media")
      .select("storage_path")
      .eq("album_id", albumId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    await supabase
      .from("albums")
      .update({ cover_path: nextMedia?.storage_path ?? null })
      .eq("id", albumId);
  }

  revalidatePath("/");
  revalidatePath(`/album/${slug}`);
}
