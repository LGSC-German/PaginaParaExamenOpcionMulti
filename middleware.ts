import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validarToken } from "@/lib/auth";

// Rutas públicas que NO requieren JWT
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/topics",
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
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/quiz/:path*",
  ],
};