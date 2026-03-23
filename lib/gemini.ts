import { GoogleGenerativeAI } from "@google/generative-ai";

// Asegúrate de que la API Key se esté leyendo
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY no configurada en el .env");

const genAI = new GoogleGenerativeAI(apiKey);

export async function generarPreguntas(topic: string, cantidad: number) {
  try {
    // Aquí llamas a tu API externa o generas preguntas
    // Ejemplo mock:
    return [
      { pregunta: `¿Qué es ${topic}?`, opciones: ["A", "B", "C"], respuesta: "A" },
      // ...
    ];
  } catch (error) {
    console.error("Error en generarPreguntas:", error);
    return null;
  }
}
