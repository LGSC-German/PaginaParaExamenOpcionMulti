import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, email, score, created_at FROM usuarios WHERE id = ?",
      [params.id]
    );
    conn.release();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al obtener el usuario" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const { nombre, email } = await req.json();

    if (!nombre && !email) {
      return NextResponse.json(
        { error: "Se requiere al menos nombre o email" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const existing = await conn.query("SELECT id FROM usuarios WHERE id = ?", [params.id]);

    if (existing.length === 0) {
      conn.release();
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (nombre) { fields.push("nombre = ?"); values.push(nombre); }
    if (email)  { fields.push("email = ?");  values.push(email); }
    values.push(params.id);

    await conn.query(
      `UPDATE usuarios SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );
    conn.release();

    return NextResponse.json({ message: "Usuario actualizado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const conn = await pool.getConnection();
    const existing = await conn.query("SELECT id FROM usuarios WHERE id = ?", [params.id]);

    if (existing.length === 0) {
      conn.release();
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await conn.query("DELETE FROM usuarios WHERE id = ?", [params.id]);
    conn.release();

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 });
  }
}