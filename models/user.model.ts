import pool from "@/lib/db";

export async function getUsers() {
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT id, nombre, email FROM usuarios");
  conn.release();
  return rows;
}

export async function getUserById(id: number) {
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT id, nombre, email FROM usuarios WHERE id = ?", [id]);
  conn.release();
  return rows[0];
}

export async function createUser(nombre: string, email: string, password: string) {
  const conn = await pool.getConnection();
  await conn.query("INSERT INTO usuarios(nombre, email, password) VALUES (?, ?, ?)", [nombre, email, password]);
  conn.release();
}
