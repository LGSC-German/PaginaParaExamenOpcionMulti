import jwt from "jsonwebtoken";

interface Payload {
  id: number;
  name: string;
  password: string;
}

export function crearToken(id: number, name: string, password: string): string {
  const payload: Payload = { id, name, password };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "24h" });
}

export function validarToken(token?: string): Payload {
  if (!token) throw new Error("Acceso denegado");
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as Payload;
  } catch {
    throw new Error("Token inválido o expirado");
  }
}