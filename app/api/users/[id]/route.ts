import { Router, Request, Response } from "express";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// GET /api/users/:id → obtener usuario por ID
router.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { id } = req.params;
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, email, score, created_at FROM usuarios WHERE id = ?",
      [id]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

// PUT /api/users/:id → actualizar nombre o email
router.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { id } = req.params;
    const { nombre, email } = req.body;

    if (!nombre && !email) {
      return res.status(400).json({ error: "Se requiere al menos nombre o email para actualizar" });
    }

    const conn = await pool.getConnection();

    // Verificar que el usuario existe
    const existing = await conn.query("SELECT id FROM usuarios WHERE id = ?", [id]);
    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Construir consulta dinámica
    const fields: string[] = [];
    const values: any[] = [];

    if (nombre) { fields.push("nombre = ?"); values.push(nombre); }
    if (email)  { fields.push("email = ?");  values.push(email); }
    values.push(id);

    await conn.query(
      `UPDATE usuarios SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );
    conn.release();

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

// DELETE /api/users/:id → eliminar usuario
router.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { id } = req.params;
    const conn = await pool.getConnection();

    const existing = await conn.query("SELECT id FROM usuarios WHERE id = ?", [id]);
    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await conn.query("DELETE FROM usuarios WHERE id = ?", [id]);
    conn.release();

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

export default router;