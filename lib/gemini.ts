import { GoogleGenerativeAI } from "@google/generative-ai";

// Asegúrate de que la API Key se esté leyendo
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY no configurada en el .env");

const genAI = new GoogleGenerativeAI(apiKey);

export async function generarPreguntas(tema: string, cantidad: number = 10) {
  // Probaremos con 'gemini-1.5-flash' sin sufijos raros
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Genera un cuestionario de ${cantidad} preguntas sobre ${tema}. 
  Responde exclusivamente en formato JSON: [{"pregunta":"...","opciones":["...","...","...","..."],"respuesta_correcta":0}]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpieza de Markdown por si acaso
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Error dentro de generarPreguntas:", error.message);
    throw error;
  }
}