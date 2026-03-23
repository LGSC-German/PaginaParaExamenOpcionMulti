import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import { generarPreguntas } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    //const token = req.headers.get("authorization")?.replace("Bearer ", "");
    //validarToken(token);

    const topic = req.nextUrl.searchParams.get("topic");
    if (!topic) {
      return NextResponse.json({ error: "El parámetro 'topic' es requerido" }, { status: 400 });
    }

    const preguntas = await generarPreguntas(topic, 10);
    return NextResponse.json(preguntas);
  } catch (err: any) {
    console.error("--- ERROR CRÍTICO EN API QUIZ ---");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack); // Esto nos dirá la línea exacta
    console.error("---------------------------------");
    
    return NextResponse.json({ error: err.message }, { status: 500 });
    /*
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al generar preguntas" }, { status: 500 });
    */
  }
}