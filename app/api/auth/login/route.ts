import { Router, Request, Response } from "express";
import { crearToken } from "@/middleware";
import pool from "@/lib/db";


const router = Router();

// Obtener todos los usuarios
export async function getUsers(req: Request, res: Response) {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, nombre, email FROM usuarios");
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

// Ruta de login
router.post("/login", (req: Request, res: Response) => {
  const { usuario, password } = req.body;

  if (usuario === "admin" && password === "1234") {
    const token = crearToken(1, "admin", "1234");
    res.json({ token });
  } else {
    res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
});

export default router;
