import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import { DeleteAlbumButton } from "@/components/delete-album-button";
import { PhotoGrid } from "@/components/photo-grid";
import { UploadButton } from "@/components/upload-button";
import { getAlbumBySlug } from "@/lib/albums";

export default async function AlbumPage(
  props: PageProps<"/album/[slug]">,
) {
  const { slug } = await props.params;
  const result = await getAlbumBySlug(slug);

  if (!result) {
    notFound();
  }

  const { album, media } = result;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-8 sm:px-8 sm:pt-16">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <BrandLockup size="sm" />
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Todos los álbumes
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bosque">
              {album.emoji} {album.country_name}
            </p>
            <h1 className="mt-2 break-words text-[clamp(1.875rem,5vw,3rem)] font-semibold leading-tight text-foreground">
              {album.name}
            </h1>
          </div>
          <DeleteAlbumButton albumId={album.id} slug={album.slug} />
        </div>
      </div>

      <PhotoGrid
        media={media}
        albumId={album.id}
        slug={album.slug}
        coverPath={album.cover_path}
      />
      <UploadButton albumId={album.id} slug={album.slug} />
    </main>
  );
}
