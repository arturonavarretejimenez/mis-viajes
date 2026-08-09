"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { deleteMedia, setAlbumCover } from "@/app/actions/media";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { publicMediaUrl } from "@/lib/storage";
import type { Media } from "@/lib/types";

type PhotoGridProps = {
  media: Media[];
  albumId: string;
  slug: string;
  coverPath: string | null;
};

export function PhotoGrid({ media, albumId, slug, coverPath }: PhotoGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSettingCover, startCoverTransition] = useTransition();
  const [justSetCover, setJustSetCover] = useState(false);

  const selected = media.find((m) => m.id === selectedId) ?? null;
  const confirming = media.find((m) => m.id === confirmingId) ?? null;
  const selectedIsCover = selected ? selected.storage_path === coverPath : false;

  function handleDelete(item: Media) {
    startTransition(async () => {
      await deleteMedia(item.id, item.storage_path, albumId, slug);
      setConfirmingId(null);
      setSelectedId(null);
    });
  }

  function handleSetCover(item: Media) {
    startCoverTransition(async () => {
      await setAlbumCover(albumId, item.storage_path, slug);
      setJustSetCover(true);
      setTimeout(() => setJustSetCover(false), 1800);
    });
  }

  if (media.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay fotos en este álbum"
        description="Toca el botón para guardar la primera, con la cámara o la galería del móvil."
      />
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      >
        {media.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className="group relative aspect-square min-h-[44px] overflow-hidden rounded-2xl border border-surface-border bg-surface transition-transform duration-150 active:scale-[0.98]"
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              show: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Image
              src={publicMediaUrl(item.storage_path)}
              alt="Foto del álbum"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
            {item.storage_path === coverPath ? (
              <span className="absolute left-2 top-2 rounded-full border border-surface-border bg-blanco/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tierra">
                Portada
              </span>
            ) : null}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="relative flex max-h-full w-full max-w-3xl flex-col items-center"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-square w-full max-h-[70vh] overflow-hidden rounded-2xl">
                <Image
                  src={publicMediaUrl(selected.storage_path)}
                  alt="Foto del álbum"
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <div className="mt-4 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                <button
                  type="button"
                  onClick={() => handleSetCover(selected)}
                  disabled={selectedIsCover || isSettingCover}
                  className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full border border-tierra bg-tierra/15 px-5 text-base font-semibold text-blanco transition-transform duration-150 hover:bg-tierra/25 active:scale-95 disabled:cursor-default disabled:border-blanco/20 disabled:bg-transparent disabled:text-blanco/50 disabled:active:scale-100 sm:h-11 sm:w-auto sm:text-sm"
                >
                  {selectedIsCover
                    ? "Es la portada"
                    : isSettingCover
                      ? "Guardando…"
                      : "Usar como portada"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(selected.id)}
                  className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-lust px-5 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 sm:h-11 sm:w-auto sm:text-sm"
                >
                  Borrar foto
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full border border-blanco/30 px-5 text-base font-medium text-blanco transition-transform duration-150 hover:bg-blanco/10 active:scale-95 sm:h-11 sm:w-auto sm:min-w-[5.5rem] sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
              {justSetCover ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-blanco/80"
                >
                  Portada actualizada
                </motion.p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming !== null}
        title="Borrar foto"
        description="Esta acción no se puede deshacer. La foto se eliminará para siempre del álbum."
        pending={isPending}
        onConfirm={() => confirming && handleDelete(confirming)}
        onCancel={() => setConfirmingId(null)}
      />
    </>
  );
}
