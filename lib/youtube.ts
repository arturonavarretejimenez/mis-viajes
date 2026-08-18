/**
 * Extrae el ID de un vídeo de YouTube a partir de las formas habituales de
 * enlace: watch?v=, youtu.be/, /embed/, /shorts/ y /live/.
 * Devuelve null si no reconocemos el enlace como de YouTube.
 */
export function youtubeIdFromUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const isYoutube =
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "youtu.be";

  if (!isYoutube) return null;

  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) {
      candidate = parts[1] ?? null;
    }
  }

  if (!candidate) return null;
  // Los IDs de YouTube son 11 caracteres de este alfabeto.
  return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
}

/** URL para el iframe. Usamos el dominio sin cookies de seguimiento. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

/** Enlace normal, por si alguien quiere abrirlo en YouTube. */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
