import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";

// Rutas públicas que NO requieren JWT
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/topics",
  "/api/quiz",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dejar pasar rutas públicas sin verificar token
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Leer token desde cookie o header Authorization
  const token =
    request.cookies.get("token")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  try {
    validarToken(token);
    return NextResponse.next();
  } catch {
    // Rutas de API → respuesta JSON 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // Páginas protegidas → redirigir al login
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};