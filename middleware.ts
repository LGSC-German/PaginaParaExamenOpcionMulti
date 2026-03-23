import jwt from "jsonwebtoken";

// Definimos el tipo del payload
interface Payload {
  id: number;
  name: string;
  password: string;
}

// Crear token
export function crearToken(id: number, name: string, password: string): string {
  const payload: Payload = { id, name, password };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );
}

// Validar token
export function validarToken(token?: string): Payload {
  if (!token) {
    throw new Error("Acceso denegado");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Payload;
    return decoded;
  } catch (err) {
    throw new Error("Token inválido o expirado");
  }
}
