import { NextRequest, NextResponse } from "next/server";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    validarToken(token);

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, email, score, created_at FROM usuarios"
    );
    conn.release();

    return NextResponse.json(rows);
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}/*
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    console.log("TOKEN RECIBIDO:", token?.slice(0, 20));
    validarToken(token);
    // ...
  } catch (err: any) {
    console.log("ERROR VALIDACION:", err.message);
    // ...
  }
}*/