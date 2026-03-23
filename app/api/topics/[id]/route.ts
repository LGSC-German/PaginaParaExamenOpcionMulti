import { Router, Request, Response } from "express";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// DELETE /api/topics/:id → eliminar un tema (requiere JWT)
router.delete("/api/topics/:id", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { id } = req.params;

    const conn = await pool.getConnection();

    const existing = await conn.query(
      "SELECT id, nombre FROM temas WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Tema no encontrado" });
    }

    await conn.query("DELETE FROM temas WHERE id = ?", [id]);
    conn.release();

    res.json({ message: "Tema eliminado exitosamente" });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al eliminar el tema" });
  }
});

export default router;