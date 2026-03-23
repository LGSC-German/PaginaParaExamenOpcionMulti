import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import { generarPreguntas } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 });
    }

    const decoded = validarToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    const topic = req.nextUrl.searchParams.get("topic"); // <-- corregido
    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      return NextResponse.json({ error: "El parámetro 'topic' es requerido y debe ser una cadena no vacía" }, { status: 400 });
    }

    const preguntas = await generarPreguntas(topic.trim(), 10);
    if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
      return NextResponse.json({ error: "No se pudieron generar preguntas para el tema especificado" }, { status: 500 });
    }

    return NextResponse.json({ preguntas });
  } catch (err: any) {
    console.error("Error en API /api/quiz:", err.message);
    console.error("Stack trace:", err.stack);

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
