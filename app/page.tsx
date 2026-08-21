import { AlbumGrid } from "@/components/album-grid";
import { BrandLockup } from "@/components/brand-lockup";
import { CreateAlbumLauncher } from "@/components/create-album-launcher";
import { getAlbums } from "@/lib/albums";
import { isOwner } from "@/lib/session";

export default async function Home() {
  const albums = await getAlbums();
  const canEdit = await isOwner();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:gap-10 sm:px-8 sm:pb-16 sm:pt-16">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-3">
          <BrandLockup size="lg" showTagline href={null} />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Abre el mapa de tus mejores momentos. Cada álbum guarda las
            fotos de un lugar que ha pasado por aquí.
          </p>
        </div>
        {canEdit ? (
          <div className="w-full shrink-0 sm:w-auto">
            <CreateAlbumLauncher />
          </div>
        ) : (
          <p className="shrink-0 self-start rounded-full border border-surface-border bg-blanco px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Modo visitante · solo lectura
          </p>
        )}
      </header>

      <AlbumGrid albums={albums} />
    </main>
  );
}
