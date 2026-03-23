"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  rank: number;
  id: number;
  nombre: string;
  score: number;
  isCurrentUser?: boolean;
}

const PAGE_SIZE = 5;

const RANK_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: "#fef9c3", color: "#854d0e" },
  2: { bg: "#f1f5f9", color: "#475569" },
  3: { bg: "#fff7ed", color: "#9a3412" },
};

const NAV_ITEMS = [
  { icon: "quiz",        label: "Examen",  href: "/quiz",      active: false },
  { icon: "leaderboard", label: "Ranking", href: "/dashboard", active: true  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [students, setStudents]     = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [tab, setTab]               = useState<"global" | "group">("global");
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Carga usuarios desde GET /api/users y construye el ranking por score
  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/"); return; }

      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) { router.push("/"); return; }

        const data = await res.json();

        // Decodificar el JWT para obtener el id del usuario actual
        const payload = JSON.parse(atob(token.split(".")[1]));
        const myId = payload.id;

        // Ordenar por score descendente y asignar rank
        const sorted: Student[] = [...data]
          .sort((a: any, b: any) => b.score - a.score)
          .map((u: any, i: number) => ({
            rank: i + 1,
            id: u.id,
            nombre: u.nombre,
            score: parseFloat(u.score) || 0,
            isCurrentUser: u.id === myId,
          }));

        setStudents(sorted);
        setCurrentUser(sorted.find((s) => s.isCurrentUser) ?? null);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  if (!mounted || loading) return null;

  const totalPages   = Math.ceil(students.length / PAGE_SIZE);
  const pageStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

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

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e0e3e5" }}>
        <span className="text-xl font-extrabold tracking-tight"
          style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
          QUIZ
        </span>
        {/* Botón cerrar sesión */}
        <button onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "#737785" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ba1a1a"; e.currentTarget.style.backgroundColor = "#ffeaea"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#737785"; e.currentTarget.style.backgroundColor = "transparent"; }}>
          <span className="material-symbols-outlined text-base">logout</span>
          Cerrar sesión
        </button>
      </header>

      {/* Sidebar desktop */}
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

          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Tarjeta de bienvenida con nombre real del usuario */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-60"
              style={{ backgroundColor: "#0056d2" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"
                style={{ backgroundColor: "rgba(0,64,161,0.4)" }} />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ fontFamily: "'Inter',sans-serif", backgroundColor: "rgba(218,226,255,0.15)", color: "#dae2ff" }}>
                  ¡Bienvenido!
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight"
                  style={{ fontFamily: "'Manrope',sans-serif", color: "#ffffff" }}>
                  {currentUser ? `Hola, ${currentUser.nombre.split(" ")[0]}.` : "Hola."}
                </h1>
              </div>
              <div className="relative z-10 flex gap-4 mt-8 flex-wrap">
                <Link href="/quiz"
                  className="px-6 py-3 rounded-md font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#ffffff", color: "#0040a1", fontFamily: "'Manrope',sans-serif" }}>
                  Iniciar Evaluación
                </Link>
              </div>
            </div>

            {/* Tarjeta de estadísticas del usuario actual */}
            <div className="rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-6"
              style={{ backgroundColor: "#ffffff", boxShadow: "0 20px 40px rgba(25,28,30,0.06)" }}>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#424654" }}>Tu Mejor Puntaje</p>
                <div className="text-6xl font-black" style={{ fontFamily: "'Manrope',sans-serif", color: "#0040a1" }}>
                  {currentUser?.score ?? 0}<span className="text-3xl">%</span>
                </div>
              </div>
              <div className="w-full h-px" style={{ backgroundColor: "#eceef0" }} />
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#424654" }}>Ranking Actual</p>
                <div className="text-3xl font-bold" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                  {currentUser?.rank ?? "-"}°{" "}
                  <span className="text-lg font-normal" style={{ color: "#424654" }}>de {students.length}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Leaderboard */}
          <section className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                  Tabla de Clasificación
                </h3>
                <p className="text-sm" style={{ color: "#424654" }}>Rankings por mejor puntaje</p>
              </div>

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

            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(25,28,30,0.04)" }}>

              <div className="grid grid-cols-12 gap-4 px-8 py-4 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: "#f2f4f6", color: "#424654" }}>
                <div className="col-span-1">Rango</div>
                <div className="col-span-8">Estudiante</div>
                <div className="col-span-3 text-right">Puntaje</div>
              </div>

              <div style={{ borderTop: "1px solid #f2f4f6" }}>
                {pageStudents.map((student) => {
                  const rankStyle = RANK_STYLE[student.rank];
                  const isUser    = student.isCurrentUser;
                  return (
                    <div key={student.id}
                      className="grid grid-cols-12 gap-4 px-8 py-5 items-center transition-colors relative"
                      style={{ backgroundColor: isUser ? "rgba(0,64,161,0.04)" : undefined, borderTop: "1px solid #f2f4f6" }}
                      onMouseEnter={(e) => { if (!isUser) e.currentTarget.style.backgroundColor = "#f7f9fb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isUser ? "rgba(0,64,161,0.04)" : ""; }}>

                      {isUser && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "#0040a1" }} />}

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

                      <div className="col-span-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isUser ? "#0040a1" : "#e6e8ea" }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: isUser ? "#ffffff" : "#424654" }}>person</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm" style={{ fontFamily: "'Manrope',sans-serif", color: "#191c1e" }}>
                            {student.nombre}
                          </span>
                          {isUser && <span className="text-[10px] font-bold uppercase" style={{ color: "#0040a1" }}>Tú</span>}
                        </div>
                      </div>

                      <div className="col-span-3 text-right">
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
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
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

      {/* Nav móvil */}
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