import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import { generarPreguntas } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    console.log("[QUIZ API] Iniciando solicitud...");

    // Validar token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    console.log("[QUIZ API] Token presente:", !!token);
    
    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 });
    }

    try {
      const decoded = validarToken(token);
      if (!decoded) {
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
      }
      console.log("[QUIZ API] Token validado correctamente");
    } catch (tokenError: any) {
      console.error("[QUIZ API] Error validating token:", tokenError.message);
      return NextResponse.json({ error: "Token inválido: " + tokenError.message }, { status: 401 });
    }

    // Obtener y validar parámetro topic
    const topic = req.nextUrl.searchParams.get("topic");
    console.log("[QUIZ API] Tema recibido:", topic);
    
    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      return NextResponse.json({ error: "El parámetro 'topic' es requerido y debe ser una cadena no vacía" }, { status: 400 });
    }

    // Generar preguntas
    console.log("[QUIZ API] Generando preguntas para tema:", topic.trim());
    
    try {
      const preguntas = await generarPreguntas(topic.trim(), 10);
      
      if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
        console.error("[QUIZ API] Respuesta inválida de generarPreguntas");
        return NextResponse.json({ error: "No se pudieron generar preguntas para el tema especificado" }, { status: 500 });
      }

      console.log("[QUIZ API] ✓ Preguntas generadas exitosamente:", preguntas.length);
      return NextResponse.json({ preguntas });
    } catch (geminiError: any) {
      console.error("[QUIZ API] Error en generarPreguntas:", geminiError.message);
      return NextResponse.json({ error: "Error al generar preguntas: " + geminiError.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[QUIZ API] ✗ Error crítico no capturado:", err.message);
    console.error("[QUIZ API] Stack:", err.stack);

    return NextResponse.json(
      { error: "Error interno del servidor", details: err.message },
      { status: 500 }
    );
  }
}
