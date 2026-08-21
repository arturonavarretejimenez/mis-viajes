import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, roleFromCookie } from "@/lib/auth";

export const config = {
  // Todo excepto los estáticos de Next y la propia pantalla de contraseña.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|login).*)"],
};

export async function proxy(request: NextRequest) {
  // Aquí solo comprobamos que la cookie sea válida (propietario o visitante).
  // Lo que puede hacer cada rol se decide en el servidor, en cada acción.
  const role = await roleFromCookie(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (role) {
    return NextResponse.next();
  }

  const url = new URL("/login", request.url);
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (target && target !== "/") {
    url.searchParams.set("next", target);
  }

  return NextResponse.redirect(url);
}
