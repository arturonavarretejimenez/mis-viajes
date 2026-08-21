"use client";

import { useActionState, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  setFeaturedVideo,
  type FeaturedVideoState,
} from "@/app/actions/featured-video";
import { youtubeEmbedUrl, youtubeIdFromUrl } from "@/lib/youtube";

const initialState: FeaturedVideoState = { error: null, savedAt: null };

type FeaturedVideoProps = {
  albumId: string;
  slug: string;
  albumName: string;
  videoUrl: string | null;
  canEdit: boolean;
};

export function FeaturedVideo({
  albumId,
  slug,
  albumName,
  videoUrl,
  canEdit,
}: FeaturedVideoProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    setFeaturedVideo,
    initialState,
  );
  const fieldId = useId();

  // Al guardar bien, cerramos el formulario. Se ajusta durante el render
  // (patrón recomendado por React) en vez de con un efecto.
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  if (state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt);
    if (state.savedAt) setEditing(false);
  }

  const videoId = videoUrl ? youtubeIdFromUrl(videoUrl) : null;

  if (!canEdit && !videoId) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-bosque">
          Vídeo destacado
        </h2>
        {canEdit && videoId && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-h-[36px] items-center rounded-full border border-surface-border bg-blanco px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-tierra/40 hover:text-foreground"
          >
            Cambiar
          </button>
        ) : null}
      </div>

      {videoId ? (
        <div className="overflow-hidden rounded-3xl border border-surface-border bg-piedra shadow-sm shadow-piedra/10">
          <div className="relative aspect-video w-full">
            <iframe
              src={youtubeEmbedUrl(videoId)}
              title={`Vídeo destacado de ${albumName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      ) : canEdit && !editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex min-h-[88px] w-full flex-col items-center justify-center gap-1 rounded-3xl border border-dashed border-borde bg-surface/60 px-4 py-5 text-center transition-colors hover:border-tierra/50 hover:bg-surface"
        >
          <span className="text-sm font-semibold text-foreground">
            + Añadir vídeo destacado
          </span>
          <span className="text-xs text-muted-foreground">
            Pega el enlace de un vídeo de YouTube y se verá aquí arriba.
          </span>
        </button>
      ) : null}

      <AnimatePresence initial={false}>
        {canEdit && editing ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <form
              action={formAction}
              className="flex flex-col gap-3 rounded-3xl border border-surface-border bg-blanco p-4 shadow-sm shadow-piedra/5"
            >
              <input type="hidden" name="album_id" value={albumId} />
              <input type="hidden" name="slug" value={slug} />

              <label
                htmlFor={fieldId}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Enlace de YouTube
              </label>
              <input
                id={fieldId}
                name="url"
                type="url"
                inputMode="url"
                defaultValue={videoUrl ?? ""}
                placeholder="https://www.youtube.com/watch?v=…"
                autoFocus
                aria-invalid={state.error ? true : undefined}
                aria-describedby={state.error ? `${fieldId}-error` : undefined}
                className="h-12 w-full rounded-2xl border border-surface-border bg-surface px-4 text-base text-foreground outline-none transition-colors focus:border-tierra"
              />

              {state.error ? (
                <p
                  id={`${fieldId}-error`}
                  role="alert"
                  className="text-sm font-medium text-lust"
                >
                  {state.error}
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Si el vídeo es <strong>no listado</strong>, solo lo verá quien
                  entre aquí. Deja el campo vacío y guarda para quitarlo.
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                  className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full border border-surface-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full bg-tierra px-6 text-sm font-semibold text-blanco shadow-sm shadow-piedra/15 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {pending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
