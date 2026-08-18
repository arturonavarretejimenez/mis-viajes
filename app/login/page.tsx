import { BrandLockup } from "@/components/brand-lockup";
import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/auth";

export const metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(
    Array.isArray(params.next) ? params.next[0] : params.next,
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-16">
      <div className="flex flex-col gap-3">
        <BrandLockup size="lg" showTagline href={null} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Este álbum es privado. Escribe la contraseña para entrar.
        </p>
      </div>

      <div className="rounded-3xl border border-surface-border bg-blanco/70 p-5 shadow-sm shadow-piedra/5 sm:p-6">
        <LoginForm next={next} />
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Solo hace falta escribirla una vez por dispositivo.
      </p>
    </main>
  );
}
