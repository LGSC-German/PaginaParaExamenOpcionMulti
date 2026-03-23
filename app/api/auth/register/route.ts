import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

const router = Router();

// POST /api/users/register → registro de nuevo usuario
router.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body;

    const conn = await pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.query(
      "INSERT INTO usuarios(nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );
    conn.release();

    res.json({ message: "Usuario creado exitosamente" });
  } catch {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

export default router;