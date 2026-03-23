import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { crearToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, password FROM usuarios WHERE email = ?",
      [email]
    );
    conn.release();

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { mensaje: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = crearToken(user.id, user.nombre, user.password);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}