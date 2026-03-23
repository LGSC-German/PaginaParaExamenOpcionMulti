"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Estructura de un estudiante en el leaderboard
interface Student {
  rank: number;
  name: string;
  score: number;
  time: string;
  isCurrentUser?: boolean;
}

// 🔌 BD: reemplazar con fetch a GET /api/users/scores?order=desc
//        La API consulta la tabla `scores` de MariaDB y devuelve este mismo formato
const ALL_STUDENTS: Student[] = [
  { rank: 1,  name: "Sarah Jenkins",  score: 99.2, time: "14m 22s" },
  { rank: 2,  name: "Marcus Thorne",  score: 98.5, time: "16m 45s" },
  { rank: 3,  name: "Leo Vane",       score: 97.0, time: "12m 10s" },
  { rank: 4,  name: "Priya Sharma",   score: 95.4, time: "13m 05s" },
  { rank: 5,  name: "James Park",     score: 94.1, time: "17m 30s" },
  { rank: 6,  name: "Lena Koch",      score: 92.8, time: "11m 50s" },
  { rank: 7,  name: "Omar Hassan",    score: 91.3, time: "20m 00s" },
  { rank: 8,  name: "Mei Lin",        score: 90.0, time: "15m 10s" },
  { rank: 9,  name: "Carlos Ruiz",    score: 89.7, time: "18m 45s" },
  { rank: 10, name: "Anna Becker",    score: 88.2, time: "14m 30s" },
  { rank: 11, name: "Tom Nguyen",     score: 86.5, time: "16m 00s" },
  { rank: 12, name: "Alex Rivera",    score: 85.0, time: "18m 32s", isCurrentUser: true },
  { rank: 13, name: "Elena Moretti",  score: 84.8, time: "15m 55s" },
  { rank: 14, name: "Jasmine Cho",    score: 83.5, time: "19m 12s" },
  { rank: 15, name: "Noah Williams",  score: 82.0, time: "21m 00s" },
];

// Cantidad de filas visibles por página en el leaderboard
const PAGE_SIZE = 5;

// Colores especiales para el top 3
const RANK_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: "#fef9c3", color: "#854d0e" },
  2: { bg: "#f1f5f9", color: "#475569" },
  3: { bg: "#fff7ed", color: "#9a3412" },
};

// Ítems del sidebar y nav móvil
const NAV_ITEMS = [
  { icon: "quiz",        label: "Examen",  href: "/quiz",      active: false },
  { icon: "leaderboard", label: "Ranking", href: "/dashboard", active: true  },
];

export default function DashboardPage() {
  // Controla qué tab del leaderboard está activa: global o grupo
  // 🔌 BD: al cambiar el tab, hacer fetch a GET /api/users/scores?filter=group o ?filter=global
  const [tab, setTab] = useState<"global" | "group">("global");

  // Página actual de la tabla de clasificación
  const [page, setPage] = useState(1);

  // Evita errores de hidratación SSR/cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  // Calcula el total de páginas y el slice de estudiantes visible
  const totalPages  = Math.ceil(ALL_STUDENTS.length / PAGE_SIZE);
  const pageStudents = ALL_STUDENTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Encuentra al usuario autenticado dentro de la lista
  // 🔌 BD: isCurrentUser debe venir marcado desde la API comparando con el userId del JWT
  const currentUser = ALL_STUDENTS.find((s) => s.isCurrentUser)!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f9fb", color: "#191c1e", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          display: inline-block; line-height: 1;
        }
      `}</style>

      {/* Barra superior con nombre de la app */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0e3e5" }}>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full transition-colors"
            style={{ color: "#0040a1" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dae2ff")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
          </button>
          <span className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
            QUIZ
          </span>
        </div>
      </header>

      {/* Sidebar de navegación — solo visible en desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen pt-20 border-r"
        style={{ width: "16rem", backgroundColor: "#f2f4f6", borderColor: "#e0e3e5" }}>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                fontFamily: "'Manrope',sans-serif",
                color: item.active ? "#0040a1" : "#424654",
                backgroundColor: item.active ? "rgba(0,64,161,0.06)" : "transparent",
                borderRight: item.active ? "4px solid #0040a1" : "4px solid transparent",
                fontWeight: item.active ? 700 : 500,
              }}>
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="md:ml-64 pt-24 pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Sección Hero ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Tarjeta de felicitación
                🔌 BD: reemplazar "Alex" con el nombre del usuario autenticado → GET /api/users/me */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-60"
              style={{ backgroundColor: "#0056d2" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"
                style={{ backgroundColor: "rgba(0,64,161,0.4)" }} />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ fontFamily: "'Inter',sans-serif", backgroundColor: "rgba(218,226,255,0.15)", color: "#dae2ff" }}>
                  ¡Examen Completado!
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight"
                  style={{ fontFamily: "'Manrope',sans-serif", color: "#ffffff" }}>
                  Buen Trabajo, Alex.
                </h1>
              </div>
              <div className="relative z-10 flex gap-4 mt-8 flex-wrap">
                {/* Botón para ver respuestas del examen
                    🔌 BD: redirigir a /quiz/review?id={examId} para cargar respuestas desde `scores` */}
                <button className="px-6 py-3 rounded-md font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#ffffff", color: "#0040a1", fontFamily: "'Manrope',sans-serif" }}>
                  Revisar Respuestas
                </button>
                {/* Botón para repetir el examen — reinicia el quiz */}
                <button className="px-6 py-3 rounded-md font-semibold text-sm transition-colors border"
                  style={{ color: "#dae2ff", borderColor: "rgba(218,226,255,0.3)", fontFamily: "'Manrope',sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(218,226,255,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  Repetir Examen
                </button>
              </div>
            </div>

            {/* Tarjeta de estadísticas del usuario actual
                🔌 BD: currentUser.score y currentUser.rank vienen de GET /api/users/scores */}
            <div className="rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-6"
              style={{ backgroundColor: "#ffffff", boxShadow: "0 20px 40px rgba(25,28,30,0.06)" }}>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#424654" }}>Tu Puntaje</p>
                <div className="text-6xl font-black" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
                  {currentUser.score}<span className="text-3xl">%</span>
                </div>
              </div>
              <div className="w-full h-px" style={{ backgroundColor: "#eceef0" }} />
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#424654" }}>Ranking Actual</p>
                <div className="text-3xl font-bold" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                  {currentUser.rank}°{" "}
                  <span className="text-lg font-normal" style={{ color: "#424654" }}>de {ALL_STUDENTS.length}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Leaderboard ── */}
          <section className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                  Tabla de Clasificación
                </h3>
                <p className="text-sm" style={{ color: "#424654" }}>Rankings en tiempo real</p>
              </div>

              {/* Toggle Global / Mi Grupo
                  🔌 BD: al cambiar tab, hacer fetch con ?filter=global o ?filter=group */}
              <div className="flex p-1 rounded-lg" style={{ backgroundColor: "#e6e8ea" }}>
                {(["global", "group"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-2 text-xs font-bold rounded transition-all"
                    style={{
                      fontFamily: "'Manrope',sans-serif",
                      backgroundColor: tab === t ? "#ffffff" : "transparent",
                      color: tab === t ? "#0040a1" : "#424654",
                      boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}>
                    {t === "global" ? "Global" : "Mi Grupo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla del leaderboard */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(25,28,30,0.04)" }}>

              {/* Encabezado de columnas */}
              <div className="grid grid-cols-12 gap-4 px-8 py-4 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: "#f2f4f6", color: "#424654" }}>
                <div className="col-span-1">Rango</div>
                <div className="col-span-6">Estudiante</div>
                <div className="col-span-2 text-center">Puntaje</div>
                <div className="col-span-3 text-right">Tiempo</div>
              </div>

              {/* Filas de estudiantes — slice de la página actual
                  🔌 BD: pageStudents viene de ALL_STUDENTS paginado; reemplazar con datos reales */}
              <div style={{ borderTop: "1px solid #f2f4f6" }}>
                {pageStudents.map((student) => {
                  const rankStyle = RANK_STYLE[student.rank];
                  const isUser    = student.isCurrentUser;
                  return (
                    <div key={student.rank}
                      className="grid grid-cols-12 gap-4 px-8 py-5 items-center transition-colors relative"
                      style={{ backgroundColor: isUser ? "rgba(0,64,161,0.04)" : undefined, borderTop: "1px solid #f2f4f6" }}
                      onMouseEnter={(e) => { if (!isUser) e.currentTarget.style.backgroundColor = "#f7f9fb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isUser ? "rgba(0,64,161,0.04)" : ""; }}>

                      {/* Acento lateral para el usuario actual */}
                      {isUser && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "#0040a1" }} />}

                      {/* Columna: Rango con color especial para top 3 */}
                      <div className="col-span-1">
                        {rankStyle ? (
                          <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                            style={{ backgroundColor: rankStyle.bg, color: rankStyle.color }}>
                            {student.rank}
                          </span>
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center font-bold text-sm"
                            style={{ color: isUser ? "#0040a1" : "#424654", fontWeight: isUser ? 900 : 700 }}>
                            {student.rank}
                          </span>
                        )}
                      </div>

                      {/* Columna: Nombre e ícono de usuario */}
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isUser ? "#0040a1" : "#e6e8ea" }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: isUser ? "#ffffff" : "#424654" }}>person</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                            {student.name}
                          </span>
                          {isUser && <span className="text-[10px] font-bold uppercase" style={{ color: "#0040a1" }}>Tú</span>}
                        </div>
                      </div>

                      {/* Columna: Puntaje — badge especial para el #1 */}
                      <div className="col-span-2 text-center">
                        {student.rank === 1 ? (
                          <span className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: "#006c49", color: "#63f1b4" }}>
                            {student.score}%
                          </span>
                        ) : (
                          <span className="font-bold text-sm" style={{ color: "#191c1e", fontWeight: isUser ? 900 : 700 }}>
                            {student.score}%
                          </span>
                        )}
                      </div>

                      {/* Columna: Tiempo invertido en el examen */}
                      <div className="col-span-3 text-right text-sm font-medium" style={{ color: "#424654" }}>
                        {student.time}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación — navega entre páginas del leaderboard */}
              <div className="px-8 py-4 flex justify-center items-center gap-2" style={{ borderTop: "1px solid #f2f4f6" }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ color: "#424654" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6e8ea")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                    style={{ backgroundColor: page === p ? "#0040a1" : "transparent", color: page === p ? "#ffffff" : "#424654" }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ color: "#424654" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6e8ea")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Nav inferior en móvil */}
      <nav className="md:hidden fixed bottom-0 w-full flex items-center justify-around h-16 z-50"
        style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderTop: "1px solid #e0e3e5" }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: item.active ? "#0040a1" : "#737785" }}>
            <span className="material-symbols-outlined"
              style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium" style={{ fontFamily: "'Manrope',sans-serif" }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}