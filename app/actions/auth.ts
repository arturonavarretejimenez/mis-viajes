"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  safeNextPath,
  sessionToken,
} from "@/lib/auth";

export type LoginState = {
  error: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const configured = process.env.SITE_PASSWORD;
  const submitted = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!configured) {
    return {
      error:
        "Este sitio todavía no tiene contraseña configurada. Añade SITE_PASSWORD en Vercel.",
    };
  }

  // Pequeño retardo: encarece probar contraseñas a lo bruto.
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (submitted.length !== configured.length || submitted !== configured) {
    return { error: "Contraseña incorrecta." };
  }

  const token = await sessionToken();
  if (!token) {
    return { error: "No se pudo iniciar sesión. Inténtalo de nuevo." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
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
