"use client";

import { useRef, useState } from "react";
import { registerMedia } from "@/app/actions/media";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_MEDIA_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MEDIA_BUCKET,
  extensionFromMimeType,
  formatMegabytes,
  isVideoType,
  maxBytesForType,
} from "@/lib/storage";

type UploadButtonProps = {
  albumId: string;
  slug: string;
};

type Rechazo = "tipo" | "tamano-foto" | "tamano-video";

function mensajeRechazo(motivos: Set<Rechazo>): string {
  const partes: string[] = [];

  if (motivos.has("tipo")) {
    partes.push(
      "Solo guardamos fotos (JPEG, PNG, WebP, HEIC, GIF) y vídeos (MP4, MOV, WebM).",
    );
  }
  if (motivos.has("tamano-foto")) {
    partes.push(
      `Las fotos no pueden pasar de ${formatMegabytes(MAX_IMAGE_BYTES)}.`,
    );
  }
  if (motivos.has("tamano-video")) {
    partes.push(
      `Los vídeos no pueden pasar de ${formatMegabytes(MAX_VIDEO_BYTES)}. Recorta el clip en el móvil y vuelve a intentarlo.`,
    );
  }

  return partes.join(" ");
}

export function UploadButton({ albumId, slug }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    subiendoVideo: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setError(null);

    const validFiles: File[] = [];
    const motivos = new Set<Rechazo>();

    for (const file of files) {
      if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
        motivos.add("tipo");
        continue;
      }
      if (file.size > maxBytesForType(file.type)) {
        motivos.add(isVideoType(file.type) ? "tamano-video" : "tamano-foto");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setError(mensajeRechazo(motivos));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Si algunos entran y otros no, subimos los buenos y avisamos del resto.
    const avisoParcial = motivos.size > 0 ? mensajeRechazo(motivos) : null;

    setUploading(true);
    setProgress({ done: 0, total: validFiles.length, subiendoVideo: false });

    const supabase = createClient();
    let fallos = 0;

    for (const file of validFiles) {
      setProgress((prev) =>
        prev ? { ...prev, subiendoVideo: isVideoType(file.type) } : prev,
      );

      const ext = extensionFromMimeType(file.type);
      const path = `${albumId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        fallos += 1;
      } else {
        try {
          await registerMedia(albumId, slug, path, file.type);
        } catch {
          fallos += 1;
        }
      }

      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }

    setUploading(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (fallos > 0) {
      setError(
        fallos === 1
          ? "Un archivo no se pudo guardar. Inténtalo de nuevo."
          : `${fallos} archivos no se pudieron guardar. Inténtalo de nuevo.`,
      );
    } else if (avisoParcial) {
      setError(avisoParcial);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-2 px-4">
      {error ? (
        <p
          role="alert"
          className="max-w-sm rounded-2xl border border-borde bg-blanco px-4 py-2.5 text-center text-sm text-lust shadow-sm"
        >
          {error}
        </p>
      ) : null}
      {uploading && progress?.subiendoVideo ? (
        <p className="max-w-sm rounded-2xl border border-surface-border bg-blanco px-4 py-2 text-center text-xs text-muted-foreground shadow-sm">
          Los vídeos tardan más en subir. No cierres la página.
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex h-14 min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-full bg-tierra px-7 text-base font-semibold text-blanco shadow-lg shadow-piedra/20 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-70 sm:w-auto sm:min-w-[14rem] sm:text-sm"
      >
        {uploading && progress
          ? `${progress.subiendoVideo ? "Subiendo vídeo" : "Guardando"} ${Math.min(progress.done + 1, progress.total)}/${progress.total}…`
          : "+ Añadir foto o vídeo"}
      </button>
    </div>
  );
}
