import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("❌ GEMINI_API_KEY no configurada.");

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // ✅ correcto
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

export async function generarPreguntas(tema: string, cantidad: number = 10): Promise<Pregunta[]> {
  const prompt = `Genera un cuestionario de ${cantidad} preguntas de opción múltiple sobre "${tema}".`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return JSON.parse(text);
}
