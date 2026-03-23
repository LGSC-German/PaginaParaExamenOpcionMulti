import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { crearToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// POST /usuarios
router.post("/api/users", async (req: Request, res: Response) => {
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

// POST /usuarios/login
router.post("/api/users/login", async (req: Request, res: Response) => {
  try {
    const { usuario, password } = req.body;

    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, password FROM usuarios WHERE email = ?",
      [usuario]
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