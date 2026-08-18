const BUCKET = "media";

export function publicMediaUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const MEDIA_BUCKET = BUCKET;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// Tope del plan gratis de Supabase: 50 MB por archivo. Para subirlo hace falta
// cambiar el límite del proyecto (Storage → Settings) y un plan de pago.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov — lo que graba el iPhone
  "video/webm",
  "video/ogg",
  "video/x-m4v",
];

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "ogv", "m4v"];

export function isVideoType(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

/**
 * Deducimos foto/vídeo por la extensión del path porque en algunos sitios
 * (la portada del álbum) solo guardamos la ruta, no el mime_type.
 */
export function isVideoPath(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(ext);
}

export function maxBytesForType(mimeType: string): number {
  return isVideoType(mimeType) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export function extensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "video/x-m4v": "m4v",
  };
  return map[mimeType] ?? (isVideoType(mimeType) ? "mp4" : "jpg");
}

export function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
