"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  text: string;
  options: string[];
}

// ── Mock data (reemplazar con fetch a /api/topics o Gemini) ───────────────────
const QUESTIONS: Question[] = [
  { id: 1,  text: "¿Cuál es la capital de Francia?",              options: ["Berlín", "Madrid", "París", "Roma"] },
  { id: 2,  text: "¿Cuántos continentes hay en la Tierra?",       options: ["5", "6", "7", "8"] },
  { id: 3,  text: "¿Cuál es el océano más grande del mundo?",     options: ["Atlántico", "Índico", "Ártico", "Pacífico"] },
  { id: 4,  text: "¿En qué país se encuentra la Torre Eiffel?",   options: ["Italia", "Francia", "España", "Alemania"] },
  { id: 5,  text: "¿Cuál es el planeta más grande del sistema solar?", options: ["Saturno", "Neptuno", "Júpiter", "Urano"] },
  { id: 6,  text: "¿Cuántos huesos tiene el cuerpo humano adulto?", options: ["196", "206", "216", "226"] },
  { id: 7,  text: "¿Cuál es el elemento más abundante en la atmósfera terrestre?", options: ["Oxígeno", "Argón", "Dióxido de carbono", "Nitrógeno"] },
  { id: 8,  text: "¿Quién escribió 'Don Quijote de la Mancha'?",  options: ["Lope de Vega", "Miguel de Cervantes", "Francisco de Quevedo", "Góngora"] },
  { id: 9,  text: "¿Cuál es la unidad básica de la herencia genética?", options: ["Célula", "Cromosoma", "Gen", "ADN"] },
  { id: 10, text: "¿En qué año comenzó la Primera Guerra Mundial?", options: ["1912", "1914", "1916", "1918"] },
];

const LETTERS = ["A", "B", "C", "D"];

// ── Status helpers ─────────────────────────────────────────────────────────────
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
  answered: { icon: "check_circle", color: "#005136",  fill: true  },
  current:  { icon: "play_circle",  color: "#0040a1",  fill: false },
  skipped:  { icon: "error",        color: "#ba1a1a",  fill: false },
  pending:  { icon: "circle",       color: "#737785",  fill: false },
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<Record<number, number>>({});
  const [skipped, setSkipped]           = useState<Set<number>>(new Set());
  const [confidence, setConfidence]     = useState<Record<number, number>>({});
  const [submitted, setSubmitted]       = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const question   = QUESTIONS[currentIndex];
  const selected   = answers[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const score      = answeredCount > 0
    ? Math.round((answeredCount / QUESTIONS.length) * 100)
    : 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function selectOption(optIndex: number) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setSkipped((prev) => { const s = new Set(prev); s.delete(currentIndex); return s; });
  }

  function goNext() {
    if (currentIndex < QUESTIONS.length - 1) {
      if (selected === undefined) {
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

  function handleSubmit() {
    setSubmitted(true);
  }

  // ── Hydration guard ─────────────────────────────────────────────────────────
  if (!mounted) return null;

  // ── Submitted screen ────────────────────────────────────────────────────────
  if (submitted) {
    const correct = Object.keys(answers).length;
    const pct = Math.round((correct / QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ backgroundColor: "#f7f9fb", fontFamily: "'Inter', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap'); @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'); .material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';vertical-align:middle}`}</style>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#0056d2" }}>
            <span className="material-symbols-outlined text-4xl" style={{ color: "#fff", fontVariationSettings: "'FILL' 1" }}>done_all</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
            ¡Examen completado!
          </h1>
          <p className="mb-6" style={{ color: "#424654" }}>Respondiste {correct} de {QUESTIONS.length} preguntas.</p>
          <div className="text-6xl font-extrabold mb-8" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>{pct}%</div>
          <button onClick={() => { setSubmitted(false); setCurrentIndex(0); setAnswers({}); setSkipped(new Set()); }}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all"
            style={{ backgroundColor: "#0040a1", fontFamily: "'Manrope',sans-serif" }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f9fb", color: "#191c1e", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          vertical-align: middle;
        }
        .option-label input[type="radio"] { display: none; }
        .option-label input[type="radio"]:checked + .option-box {
          background-color: #0040a1;
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(0,64,161,0.25);
        }
        .option-label:hover .option-box {
          background-color: #dae2ff;
        }
        .option-label input[type="radio"]:checked + .option-box:hover {
          background-color: #0040a1;
        }
        input[type="range"]::-webkit-slider-thumb { accent-color: #0040a1; }
        .sidebar-overlay { display: none; }
        @media (max-width: 767px) {
          .sidebar-overlay { display: block; }
        }
      `}</style>

      {/* ── TopAppBar ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0e3e5" }}>
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button className="md:hidden p-1 rounded-lg transition-colors"
            style={{ color: "#424654" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
            Scholarly Sanctuary
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ backgroundColor: "#eceef0" }}>
            <span className="material-symbols-outlined" style={{ color: "#424654" }}>history_edu</span>
            <span className="font-bold text-base" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
              Porcentaje: {score}%
            </span>
          </div>
        </div>
      </header>

      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r pt-16 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ width: "16rem", backgroundColor: "#f2f4f6", borderColor: "#e0e3e5" }}>

        <div className="px-8 pt-8 pb-4">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
            Progreso del examen
          </h2>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "#737785" }}>
            {answeredCount} / {QUESTIONS.length} respondidas
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto mt-2">
          {QUESTIONS.map((q, i) => {
            const status = getStatus(i, currentIndex, answers, skipped);
            const { icon, color, fill } = STATUS_ICON[status];
            const isCurrent = status === "current";
            return (
              <button key={q.id} onClick={() => goToQuestion(i)}
                className="w-full text-left flex items-center gap-3 py-3 transition-all duration-200"
                style={{
                  paddingLeft: isCurrent ? "1rem" : "2rem",
                  paddingRight: "1rem",
                  backgroundColor: isCurrent ? "#ffffff" : "transparent",
                  borderRadius: isCurrent ? "9999px 0 0 9999px" : undefined,
                  marginLeft: isCurrent ? "1rem" : undefined,
                  color: isCurrent ? "#0040a1" : "#424654",
                  fontWeight: isCurrent ? 700 : 500,
                }}>
                <span className="material-symbols-outlined text-xl flex-shrink-0"
                  style={{ color, fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}>
                  {icon}
                </span>
                <span className="text-sm truncate" style={{ fontFamily: "'Manrope',sans-serif" }}>
                  Q{q.id}: {
                    status === "answered" ? "Respondida" :
                    status === "current"  ? "Actual" :
                    status === "skipped"  ? "Saltada" : "Pendiente"
                  }
                </span>
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-6 mt-auto">
          <div className="rounded-xl p-4" style={{ backgroundColor: "#e6e8ea" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#b2c5ff" }}>
                <span className="material-symbols-outlined" style={{ color: "#0040a1" }}>person</span>
              </div>
              <div>
                <p className="text-xs font-bold" style={{ fontFamily: "'Manrope',sans-serif" }}>Estudiante</p>
                <p className="text-[10px]" style={{ color: "#424654" }}>Quiz</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="md:ml-64 pt-24 pb-32 px-6 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">

          {/* Breadcrumb */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: "#424654" }}>
                Evaluación interactiva
              </h3>
              <h1 className="text-3xl font-extrabold tracking-tight"
                style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                Pregunta {currentIndex + 1} de {QUESTIONS.length}
              </h1>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1 items-center">
              {QUESTIONS.map((_, i) => {
                const st = getStatus(i, currentIndex, answers, skipped);
                const dotColor =
                  st === "answered" ? "#005136" :
                  st === "current"  ? "#0040a1" :
                  st === "skipped"  ? "#ba1a1a" : "#c3c6d6";
                return (
                  <div key={i} className="h-1.5 rounded-full transition-all"
                    style={{ width: st === "current" ? "3rem" : "2rem", backgroundColor: dotColor }} />
                );
              })}
            </div>
          </div>

          {/* Question card */}
          <section className="rounded-xl p-8 md:p-12 relative overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 20px 40px rgba(25,28,30,0.06)",
            }}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1"
              style={{ background: "linear-gradient(to right, #0040a1, #0056d2)" }} />

            <h2 className="text-xl md:text-2xl leading-relaxed mb-10" style={{ color: "#191c1e" }}>
              {question.text}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {question.options.map((opt, i) => (
                <label key={i} className="option-label block cursor-pointer transition-all duration-200">
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    checked={selected === i}
                    onChange={() => selectOption(i)}
                  />
                  <div className="option-box flex items-center gap-6 p-6 rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: selected === i ? "#0040a1" : "#eceef0", color: selected === i ? "#ffffff" : "#191c1e" }}>
                    <span className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg flex-shrink-0"
                      style={{ fontFamily: "'Manrope',sans-serif", backgroundColor: "rgba(255,255,255,0.2)" }}>
                      {LETTERS[i]}
                    </span>
                    <span className="font-medium text-lg">{opt}</span>
                  </div>
                </label>
              ))}
            </div>

          </section>
        </div>
      </main>

      {/* ── Bottom nav ── */}
      <footer className="fixed bottom-0 left-0 w-full flex justify-around items-center px-10 py-4 z-50 rounded-t-2xl"
        style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e0e3e5", boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
        <button onClick={goBack} disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-30"
          style={{ color: "#737785" }}
          onMouseEnter={(e) => { if (currentIndex > 0) e.currentTarget.style.color = "#0040a1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#737785"; }}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-semibold text-xs uppercase tracking-widest" style={{ fontFamily: "'Manrope',sans-serif" }}>
            Atrás
          </span>
        </button>

        <button onClick={goNext} disabled={currentIndex === QUESTIONS.length - 1}
          className="flex items-center gap-2 px-8 py-2 rounded-xl text-white font-semibold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: "#0040a1", fontFamily: "'Manrope',sans-serif", boxShadow: "0 8px 20px rgba(0,64,161,0.25)" }}>
          <span>Siguiente</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <button onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95"
          style={{ color: "#737785" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#0040a1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#737785"; }}>
          <span className="material-symbols-outlined">done_all</span>
          <span className="font-semibold text-xs uppercase tracking-widest" style={{ fontFamily: "'Manrope',sans-serif" }}>
            Enviar
          </span>
        </button>
      </footer>
    </div>
  );
}