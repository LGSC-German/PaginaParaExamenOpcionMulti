import { Router, Request, Response } from "express";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// GET /api/users → lista de usuarios (requiere JWT)
router.get("/api/users", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, email, score, created_at FROM usuarios"
    );
    conn.release();

    res.json(rows);
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

export default router;