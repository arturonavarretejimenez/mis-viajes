"use client";

/**
 * Miniatura de un vídeo. Usamos el fragmento `#t=0.1` para que el navegador
 * cargue solo los metadatos y pinte el primer fotograma como portada, sin
 * descargar el archivo entero ni necesitar generar thumbnails en el servidor.
 */
export function VideoThumb({
  src,
  className = "",
  badge = true,
}: {
  src: string;
  className?: string;
  badge?: boolean;
}) {
  return (
    <>
      <video
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden
        className={`pointer-events-none h-full w-full object-cover ${className}`}
      />
      {badge ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-piedra/55 backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              className="ml-0.5 h-5 w-5 fill-blanco"
              focusable="false"
            >
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </span>
      ) : null}
    </>
  );
}
