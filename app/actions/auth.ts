"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  cookieValueForRole,
  safeEqual,
  safeNextPath,
  type Role,
} from "@/lib/auth";

export type LoginState = {
  error: string | null;
};

/** Compara sin filtrar por timing y sin reventar si la variable no existe. */
function matches(submitted: string, configured: string | undefined): boolean {
  if (!configured) return false;
  if (submitted.length !== configured.length) return false;
  return safeEqual(submitted, configured);
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const submitted = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const ownerPassword = process.env.SITE_PASSWORD;
  const visitorPassword = process.env.VISITOR_PASSWORD;

  if (!ownerPassword && !visitorPassword) {
    return {
      error:
        "Este sitio todavía no tiene contraseña configurada. Añade SITE_PASSWORD en Vercel.",
    };
  }

  // Pequeño retardo: encarece probar contraseñas a lo bruto.
  await new Promise((resolve) => setTimeout(resolve, 400));

  let role: Role | null = null;
  if (matches(submitted, ownerPassword)) {
    role = "owner";
  } else if (matches(submitted, visitorPassword)) {
    role = "visitor";
  }

  if (!role) {
    return { error: "Contraseña incorrecta." };
  }

  const value = await cookieValueForRole(role);
  if (!value) {
    return { error: "No se pudo iniciar sesión. Inténtalo de nuevo." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
