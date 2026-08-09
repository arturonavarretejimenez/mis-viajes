"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createAlbum, type CreateAlbumState } from "@/app/actions/albums";
import { ALBUM_EMOJIS, DEFAULT_ALBUM_EMOJI } from "@/lib/album-emojis";
import { COUNTRIES } from "@/lib/countries";

const initialState: CreateAlbumState = { error: null };

export function CreateAlbumLauncher() {
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState(DEFAULT_ALBUM_EMOJI);
  const [state, formAction, pending] = useActionState(
    createAlbum,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-tierra px-6 text-sm font-semibold text-blanco shadow-sm shadow-piedra/15 transition-transform duration-150 hover:scale-[1.03] active:scale-95 sm:w-auto"
      >
        + Nuevo álbum
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pending && setOpen(false)}
          >
            <motion.div
              className="flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-surface-border bg-blanco shadow-xl shadow-piedra/10 sm:rounded-3xl"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-6">
              <h2 className="text-xl font-bold text-foreground">
                Nuevo álbum
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Elige un emoji, ponle nombre y su país.
              </p>

              <form action={formAction} className="mt-6 flex flex-col gap-4">
                <input type="hidden" name="emoji" value={emoji} />

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Emoji del álbum
                  </span>
                  <div className="grid grid-cols-6 gap-1.5 rounded-xl border border-surface-border bg-arena p-2 sm:grid-cols-8">
                    {ALBUM_EMOJIS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEmoji(option)}
                        aria-pressed={emoji === option}
                        className={`flex min-h-[44px] w-full items-center justify-center rounded-lg text-lg transition-transform duration-150 active:scale-95 ${
                          emoji === option
                            ? "bg-tierra/90"
                            : "hover:bg-borde"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Nombre del álbum
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Ej. Verano en Kioto"
                    className="h-12 min-h-[44px] rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-tierra"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="country_code"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    País
                  </label>
                  <select
                    id="country_code"
                    name="country_code"
                    required
                    defaultValue=""
                    className="h-12 min-h-[44px] rounded-xl border border-surface-border bg-arena px-4 text-base text-foreground outline-none focus:border-tierra"
                  >
                    <option value="" disabled>
                      Selecciona un país
                    </option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {state.error ? (
                  <p className="text-sm text-lust">{state.error}</p>
                ) : null}

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-transform duration-150 hover:text-foreground active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full bg-tierra px-6 text-sm font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-60"
                  >
                    {pending ? "Creando…" : "Crear álbum"}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
