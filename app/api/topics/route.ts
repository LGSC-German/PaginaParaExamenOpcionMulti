import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, nombre, created_at FROM temas ORDER BY nombre ASC");
    conn.release();
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Error al obtener los temas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const { nombre } = await req.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El campo 'nombre' es requerido" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    const existing = await conn.query("SELECT id FROM temas WHERE nombre = ?", [nombre.trim()]);

    if (existing.length > 0) {
      conn.release();
      return NextResponse.json({ error: "Ya existe un tema con ese nombre" }, { status: 409 });
    }

    const result = await conn.query("INSERT INTO temas (nombre) VALUES (?)", [nombre.trim()]);
    conn.release();

    return NextResponse.json(
      { message: "Tema creado exitosamente", id: Number(result.insertId), nombre: nombre.trim() },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al crear el tema" }, { status: 500 });
  }
}