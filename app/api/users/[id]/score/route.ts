import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const { score } = await req.json();

    if (score === undefined || score === null) {
      return NextResponse.json({ error: "El campo 'score' es requerido" }, { status: 400 });
    }

    const nuevoScore = parseFloat(score);
    if (isNaN(nuevoScore) || nuevoScore < 0 || nuevoScore > 100) {
      return NextResponse.json(
        { error: "El score debe ser un número entre 0 y 100" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, score FROM usuarios WHERE id = ?", [params.id]);

    if (rows.length === 0) {
      conn.release();
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const scoreActual = parseFloat(rows[0].score) || 0;

    if (nuevoScore <= scoreActual) {
      conn.release();
      return NextResponse.json({
        message: "El puntaje no fue actualizado (el nuevo score no supera el actual)",
        score_actual: scoreActual,
        score_enviado: nuevoScore,
        actualizado: false,
      });
    }

    await conn.query(
      "UPDATE usuarios SET score = ?, updated_at = NOW() WHERE id = ?",
      [nuevoScore, params.id]
    );
    conn.release();

    return NextResponse.json({
      message: "Puntaje actualizado exitosamente",
      score_anterior: scoreActual,
      score_nuevo: nuevoScore,
      actualizado: true,
    });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al actualizar el puntaje" }, { status: 500 });
  }
}