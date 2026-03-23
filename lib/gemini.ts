import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number; // índice 0-3
}

export async function generarPreguntas(
  tema: string,
  cantidad: number = 10
): Promise<Pregunta[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Genera ${cantidad} preguntas de opción múltiple sobre el tema: "${tema}".
Responde ÚNICAMENTE con un arreglo JSON válido, sin texto adicional, con el siguiente formato:
[
  {
    "pregunta": "¿Texto de la pregunta?",
    "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "respuesta_correcta": 0
  }
]
Donde "respuesta_correcta" es el índice (0-3) de la opción correcta dentro del arreglo "opciones".
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Eliminar posibles bloques de código markdown
  const clean = text.replace(/```json|```/g, "").trim();
  const preguntas: Pregunta[] = JSON.parse(clean);
  return preguntas;
}