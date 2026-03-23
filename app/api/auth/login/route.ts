import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { crearToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// GET /api/auth/login → autenticación de usuario
router.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, password FROM usuarios WHERE email = ?",
      [email]
    );
    conn.release();

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = crearToken(user.id, user.nombre, user.password);
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;