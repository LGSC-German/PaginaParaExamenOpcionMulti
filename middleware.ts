import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validarToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

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
  matcher: ["/api/:path*", "/dashboard/:path*", "/users/:path*"], // rutas protegidas
};