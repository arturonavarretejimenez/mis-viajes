import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

export const config = {
  // Todo excepto los estáticos de Next y la propia pantalla de contraseña.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|login).*)"],
};

export async function proxy(request: NextRequest) {
  const expected = await sessionToken();

  // Sin contraseña configurada cerramos el sitio a propósito (fail closed):
  // más vale quedarse fuera uno mismo que dejarlo abierto sin darse cuenta.
  if (expected) {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (cookie && safeEqual(cookie, expected)) {
      return NextResponse.next();
    }
  }

  const url = new URL("/login", request.url);
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (target && target !== "/") {
    url.searchParams.set("next", target);
  }

  return NextResponse.redirect(url);
}
