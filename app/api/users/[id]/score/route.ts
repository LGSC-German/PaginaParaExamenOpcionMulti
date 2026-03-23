import { Router, Request, Response } from "express";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// PUT /api/users/:id/score → actualizar puntaje solo si es mayor al anterior
router.put("/api/users/:id/score", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { id } = req.params;
    const { score } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ error: "El campo 'score' es requerido" });
    }

    const nuevoScore = parseFloat(score);
    if (isNaN(nuevoScore) || nuevoScore < 0 || nuevoScore > 100) {
      return res.status(400).json({ error: "El score debe ser un número entre 0 y 100" });
    }

    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT id, score FROM usuarios WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const scoreActual = parseFloat(rows[0].score) || 0;

    // Solo actualizar si el nuevo score es mayor
    if (nuevoScore <= scoreActual) {
      conn.release();
      return res.json({
        message: "El puntaje no fue actualizado (el nuevo score no supera el actual)",
        score_actual: scoreActual,
        score_enviado: nuevoScore,
        actualizado: false,
      });
    }

    await conn.query(
      "UPDATE usuarios SET score = ?, updated_at = NOW() WHERE id = ?",
      [nuevoScore, id]
    );
    conn.release();

    res.json({
      message: "Puntaje actualizado exitosamente",
      score_anterior: scoreActual,
      score_nuevo: nuevoScore,
      actualizado: true,
    });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al actualizar el puntaje" });
  }
});

export default router;