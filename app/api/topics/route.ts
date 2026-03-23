import { Router, Request, Response } from "express";
import { validarToken } from "@/lib/auth";
import pool from "@/lib/db";

const router = Router();

// GET /api/topics → listar todos los temas
router.get("/api/topics", async (_req: Request, res: Response) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, nombre, created_at FROM temas ORDER BY nombre ASC"
    );
    conn.release();

    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error al obtener los temas" });
  }
});

// POST /api/topics → crear nuevo tema (requiere JWT)
router.post("/api/topics", async (req: Request, res: Response) => {
  try {
    validarToken(req.headers.authorization?.split(" ")[1]);

    const { nombre } = req.body;

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El campo 'nombre' es requerido" });
    }

    const conn = await pool.getConnection();

    // Verificar duplicado
    const existing = await conn.query(
      "SELECT id FROM temas WHERE nombre = ?",
      [nombre.trim()]
    );

    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({ error: "Ya existe un tema con ese nombre" });
    }

    const result = await conn.query(
      "INSERT INTO temas (nombre) VALUES (?)",
      [nombre.trim()]
    );
    conn.release();

    res.status(201).json({
      message: "Tema creado exitosamente",
      id: Number(result.insertId),
      nombre: nombre.trim(),
    });
  } catch (err: any) {
    if (err.message === "Acceso denegado" || err.message === "Token inválido o expirado") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear el tema" });
  }
});

export default router;