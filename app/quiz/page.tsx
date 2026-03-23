"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  text: string;
  options: string[];
  respuesta_correcta: number;
}

interface Topic {
  id: number;
  nombre: string;
}

const LETTERS = ["A", "B", "C", "D"];

type Status = "answered" | "current" | "skipped" | "pending";

function getStatus(
  qIndex: number,
  currentIndex: number,
  answers: Record<number, number>,
  skipped: Set<number>
): Status {
  if (qIndex === currentIndex) return "current";
  if (answers[qIndex] !== undefined) return "answered";
  if (skipped.has(qIndex)) return "skipped";
  return "pending";
}

const STATUS_ICON: Record<Status, { icon: string; color: string; fill: boolean }> = {
  answered: { icon: "check_circle", color: "#005136", fill: true  },
  current:  { icon: "play_circle",  color: "#0040a1", fill: false },
  skipped:  { icon: "error",        color: "#ba1a1a", fill: false },
  pending:  { icon: "circle",       color: "#737785", fill: false },
};

export default function QuizPage() {
  const router = useRouter();

  const [topics, setTopics]           = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]         = useState<Record<number, number>>({});
  const [skipped, setSkipped]         = useState<Set<number>>(new Set());
  const [submitted, setSubmitted]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [userName, setUserName]       = useState("");
  const [userId, setUserId]           = useState<number | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
      setUserName(payload.name || "Estudiante");
    } catch {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();
        setTopics(data);
      } catch {
        console.error("Error al cargar temas");
      } finally {
        setLoadingTopics(false);
      }
    }
    fetchTopics();
  }, []);

  async function startQuiz(topic: Topic) {
    setSelectedTopic(topic);
    setLoadingQuestions(true);
    setAnswers({});
    setSkipped(new Set());
    setCurrentIndex(0);
    setSubmitted(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/quiz?topic=${encodeURIComponent(topic.nombre)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      console.log("Datos crudos de la API:", data);

      // --- LÓGICA DE DETECCIÓN ---
      let rawQuestions = [];

      if (Array.isArray(data)) {
        // Caso 1: La API devolvió el array directo [...]
        rawQuestions = data;
      } else if (data.preguntas && Array.isArray(data.preguntas)) {
        // Caso 2: La API devolvió { preguntas: [...] }
        rawQuestions = data.preguntas;
      } else if (data.questions && Array.isArray(data.questions)) {
        // Caso 3: La API devolvió { questions: [...] }
        rawQuestions = data.questions;
      } else {
        // Si no es ninguna de las anteriores, imprimimos qué recibimos para investigar
        console.error("Estructura no reconocida:", data);
        throw new Error("La API no devolvió un formato de preguntas válido.");
      }

      const mapped: Question[] = rawQuestions.map((q: any, i: number) => ({
        id: i + 1,
        text: q.pregunta || q.text || q.question || "Pregunta sin texto",
        options: q.opciones || q.options || [],
        respuesta_correcta: q.respuesta_correcta !== undefined ? q.respuesta_correcta : (q.correct_answer || 0),
      }));

      if (mapped.length === 0) {
        throw new Error("El arreglo de preguntas está vacío.");
      }

      setQuestions(mapped);

    } catch (error) {
      console.error("Error detallado en startQuiz:", error);
      alert("No se pudieron cargar las preguntas. Revisa la consola del navegador.");
      setSelectedTopic(null);
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function handleSubmit() {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);

    const correct = questions.reduce((acc, q, i) => {
      return answers[i] === q.respuesta_correcta ? acc + 1 : acc;
    }, 0);

    const score = Math.round((correct / questions.length) * 100);

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/users/${userId}/score`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score }),
      });
    } catch {
      console.error("Error al guardar puntaje");
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  function selectOption(optIndex: number) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setSkipped((prev) => { const s = new Set(prev); s.delete(currentIndex); return s; });
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      if (answers[currentIndex] === undefined) {
        setSkipped((prev) => new Set(prev).add(currentIndex));
      }
      setCurrentIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function goToQuestion(i: number) {
    setCurrentIndex(i);
    setSidebarOpen(false);
  }

  if (!mounted) return null;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; vertical-align:middle; }
    .option-label input[type="radio"] { display: none; }
    .option-label input[type="radio"]:checked + .option-box { background-color: #0040a1; color: #ffffff; box-shadow: 0 8px 24px rgba(0,64,161,0.25); }
    .option-label:hover .option-box { background-color: #dae2ff; }
    .option-label input[type="radio"]:checked + .option-box:hover { background-color: #0040a1; }
  `;

  // ── Pantalla de selección de tema O Cargando ──
  if (!selectedTopic || loadingQuestions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ backgroundColor: "#f7f9fb", fontFamily: "'Inter', sans-serif" }}>
        <style>{styles}</style>
        <div className="w-full max-w-lg text-center">
          {loadingQuestions ? (
            <>
              <div className="animate-spin inline-block mb-4">
                <span className="material-symbols-outlined text-5xl" style={{ color: "#0040a1" }}>
                  autorenew
                </span>
              </div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                Generando preguntas con IA...
              </h2>
              <p style={{ color: "#424654" }}>Tema: <strong>{selectedTopic?.nombre}</strong></p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                Selecciona un tema
              </h1>
              <p className="mb-8" style={{ color: "#424654" }}>
                Gemini generará 10 preguntas de opción múltiple para ti.
              </p>
              {loadingTopics ? (
                <p style={{ color: "#737785" }}>Cargando temas...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <button key={topic.id} onClick={() => startQuiz(topic)}
                      className="p-4 rounded-xl font-semibold text-left transition-all hover:scale-[1.02] active:scale-95"
                      style={{ backgroundColor: "#ffffff", color: "#191c1e", fontFamily: "'Manrope',sans-serif",
                        boxShadow: "0 4px 16px rgba(25,28,30,0.08)", border: "1px solid #e0e3e5" }}>
                      <span className="material-symbols-outlined block mb-2" style={{ color: "#0040a1" }}>topic</span>
                      {topic.nombre}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Pantalla de resultados ──
  if (submitted) {
    const correct = questions.reduce((acc, q, i) => answers[i] === q.respuesta_correcta ? acc + 1 : acc, 0);
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ backgroundColor: "#f7f9fb", fontFamily: "'Inter', sans-serif" }}>
        <style>{styles}</style>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#0056d2" }}>
            <span className="material-symbols-outlined text-4xl" style={{ color: "#fff", fontVariationSettings: "'FILL' 1" }}>done_all</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
            ¡Examen completado!
          </h1>
          <p className="mb-2" style={{ color: "#424654" }}>
            Respondiste {correct} de {questions.length} correctamente.
          </p>
          <div className="text-6xl font-extrabold mb-8" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>{pct}%</div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "#0040a1" }}>
              Ver Ranking
            </button>
            <button onClick={() => { setSelectedTopic(null); setQuestions([]); }}
              className="px-6 py-3 rounded-xl font-semibold border"
              style={{ color: "#0040a1", borderColor: "#0040a1" }}>
              Otro tema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla del quiz (Renderizado principal) ──
  const question      = questions[currentIndex];
  const selected      = answers[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const score         = answeredCount > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f9fb", color: "#191c1e", fontFamily: "'Inter', sans-serif" }}>
      <style>{styles}</style>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0e3e5" }}>
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1 rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-xl font-extrabold" style={{ color: "#0040a1" }}>QUIZ</span>
        </div>
        <div className="px-4 py-1.5 rounded-full" style={{ backgroundColor: "#eceef0" }}>
          <span className="font-bold text-base" style={{ color: "#0040a1" }}>{score}%</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r pt-16 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ width: "16rem", backgroundColor: "#f2f4f6", borderColor: "#e0e3e5" }}>
        <nav className="flex-1 overflow-y-auto mt-4">
          {questions.map((q, i) => {
            const status = getStatus(i, currentIndex, answers, skipped);
            const { icon, color, fill } = STATUS_ICON[status];
            return (
              <button key={q.id} onClick={() => goToQuestion(i)}
                className="w-full text-left flex items-center gap-3 py-3 px-6 hover:bg-white/50">
                <span className="material-symbols-outlined" style={{ color, fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-sm">Pregunta {q.id}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-32 px-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-extrabold mb-8">Pregunta {currentIndex + 1} de {questions.length}</h1>
          
          <section className="bg-white rounded-xl p-8 shadow-sm border-t-4 border-t-[#0040a1]">
            <h2 className="text-xl md:text-2xl mb-10">{question?.text}</h2>
            <div className="space-y-4">
              {question?.options.map((opt, i) => (
                <label key={i} className="option-label block cursor-pointer">
                  <input type="radio" name="quiz-opt" checked={selected === i} onChange={() => selectOption(i)} />
                  <div className="option-box flex items-center gap-4 p-5 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                    <span className="w-8 h-8 flex items-center justify-center rounded bg-white/20 font-bold">{LETTERS[i]}</span>
                    <span className="text-lg">{opt}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-4 bg-white border-t">
        <button onClick={goBack} disabled={currentIndex === 0} className="flex items-center gap-2 opacity-70 disabled:opacity-20">
          <span className="material-symbols-outlined">arrow_back</span> Atrás
        </button>
        <button onClick={goNext} disabled={currentIndex === questions.length - 1} 
          className="bg-[#0040a1] text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2">
          Siguiente <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <button onClick={handleSubmit} className="text-[#0040a1] font-bold">Enviar</button>
      </footer>
    </div>
  );
}