import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

type Params = { params: { id: string } };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const conn = await pool.getConnection();
    const existing = await conn.query("SELECT id FROM temas WHERE id = ?", [params.id]);

    if (existing.length === 0) {
      conn.release();
      return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
    }

    await conn.query("DELETE FROM temas WHERE id = ?", [params.id]);
    conn.release();

    return NextResponse.json({ message: "Tema eliminado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al eliminar el tema" }, { status: 500 });
  }
}