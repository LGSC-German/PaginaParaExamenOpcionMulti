"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  // Alterna entre la vista Login y Registro
  const [isLogin, setIsLogin] = useState(true);

  // Muestra u oculta la contraseña en el formulario de Registro
  const [showPassword, setShowPassword] = useState(false);

  // Estados del formulario de Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Estados del formulario de Registro
  const [registerData, setRegisterData] = useState({ nombre: "", email: "", password: "" });

  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── HANDLERS ──────────────────────────────────────────────────

  async function handleLogin() {
    setError(null);

    if (!loginData.email || !loginData.password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || data.error || "Credenciales inválidas");
        return;
      }

      // Guardar JWT en localStorage
      localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError(null);

    if (!registerData.nombre || !registerData.email || !registerData.password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerData.nombre,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta");
        return;
      }

      // Registro exitoso → ir al login
      setIsLogin(true);
      setError(null);
      setRegisterData({ nombre: "", email: "", password: "" });
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── RENDER ────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      <div
        className="min-h-screen flex flex-col font-body"
        style={{ backgroundColor: "#f9f9ff", color: "#191c20" }}
      >
        {/* Header: solo visible en la vista de Registro */}
        {!isLogin && (
          <header className="fixed top-0 w-full z-50 border-b"
            style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}>
            <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
              <span className="text-xl font-bold tracking-tight font-headline" style={{ color: "#191c20" }}>
                Quiz
              </span>
            </div>
          </header>
        )}

        <main
          className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden"
          style={{ paddingTop: !isLogin ? "6rem" : undefined }}
        >
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none"
            style={{ backgroundColor: "rgba(199,219,255,0.3)" }} />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-80 h-80 rounded-full blur-3xl opacity-50 pointer-events-none"
            style={{ backgroundColor: "rgba(56,117,195,0.2)" }} />

          <div className="w-full max-w-md z-10">

            {/* ── VISTA: LOGIN ── */}
            {isLogin && (
              <div>
                {/* Logo y título */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
                    style={{ backgroundColor: "#125ca9", boxShadow: "0 20px 40px rgba(18,92,169,0.2)" }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: "#ffffff" }}>auto_stories</span>
                  </div>
                  <h1 className="font-headline text-3xl font-extrabold tracking-tight" style={{ color: "#191c20" }}>Quiz</h1>
                  <p className="mt-2 font-medium" style={{ color: "#424751" }}>Bienvenido de nuevo a tu reto académico</p>
                </div>

                <div className="p-8 rounded-xl shadow-sm border"
                  style={{ backgroundColor: "#ffffff", borderColor: "rgba(194,198,211,0.3)" }}>
                  <div className="space-y-6">

                    {/* Mensaje de error */}
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: "#fff0f0", color: "#b91c1c", border: "1px solid #fecaca" }}>
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                      </div>
                    )}

                    {/* Campo email → POST /api/auth/login */}
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="block text-sm font-semibold font-headline" style={{ color: "#424751" }}>
                        Correo electrónico
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: "#727782" }}>
                          <span className="material-symbols-outlined text-xl">mail</span>
                        </div>
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="ej. correo@ejemplo.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                          className="block w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all border"
                          style={{ backgroundColor: "#f9f9ff", borderColor: "#c2c6d3", color: "#191c20" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#125ca9"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(18,92,169,0.2)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#c2c6d3"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    {/* Campo password → bcrypt compare en /api/auth/login */}
                    <div className="space-y-2">
                      <label htmlFor="login-password" className="block text-sm font-semibold font-headline" style={{ color: "#424751" }}>
                        Contraseña
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: "#727782" }}>
                          <span className="material-symbols-outlined text-xl">lock</span>
                        </div>
                        <input
                          id="login-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                          className="block w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all border"
                          style={{ backgroundColor: "#f9f9ff", borderColor: "#c2c6d3", color: "#191c20" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#125ca9"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(18,92,169,0.2)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#c2c6d3"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    {/* Botón submit → POST /api/auth/login → JWT → /dashboard */}
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full py-3.5 font-headline font-bold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#125ca9", color: "#ffffff", boxShadow: "0 10px 20px rgba(18,92,169,0.1)" }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#3875c3"; }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#125ca9"; }}
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          Iniciar Sesión
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                      )}
                    </button>

                  </div>
                </div>

                {/* Cambia a la vista de Registro */}
                <p className="text-center mt-8 text-sm font-medium" style={{ color: "#424751" }}>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => { setIsLogin(false); setError(null); }}
                    className="font-bold hover:underline decoration-2 underline-offset-4 ml-1 transition-colors"
                    style={{ color: "#125ca9" }}
                  >
                    Regístrate
                  </button>
                </p>
              </div>
            )}

            {/* ── VISTA: REGISTRO ── */}
            {!isLogin && (
              <div>
                <div className="p-8 rounded-xl shadow-sm border"
                  style={{ backgroundColor: "#ffffff", borderColor: "#c2c6d3" }}>

                  {/* Logo y título */}
                  <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#3875c3" }}>
                      <span className="material-symbols-outlined" style={{ color: "#fefcff", fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    </div>
                    <h1 className="font-headline text-2xl font-bold tracking-tight" style={{ color: "#191c20" }}>Crea tu cuenta en Quiz</h1>
                    <p className="text-sm mt-2" style={{ color: "#424751" }}>Únete a nuestra comunidad de estudiantes</p>
                  </div>

                  <div className="space-y-6">

                    {/* Mensaje de error */}
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: "#fff0f0", color: "#b91c1c", border: "1px solid #fecaca" }}>
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                      </div>
                    )}

                    {/* Mensaje de éxito tras registro */}
                    {/* Se muestra temporalmente antes de volver al login */}

                    {/* Campo nombre → INSERT en tabla `usuarios` */}
                    <div className="space-y-2">
                      <label htmlFor="reg-nombre" className="block text-sm font-medium font-body" style={{ color: "#424751" }}>
                        Nombre completo
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: "#727782" }}>person</span>
                        <input
                          id="reg-nombre"
                          name="nombre"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={registerData.nombre}
                          onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all border"
                          style={{ backgroundColor: "#f9f9ff", borderColor: "#c2c6d3", color: "#191c20" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#125ca9"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(18,92,169,0.2)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#c2c6d3"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    {/* Campo email → INSERT en tabla `usuarios` */}
                    <div className="space-y-2">
                      <label htmlFor="reg-email" className="block text-sm font-medium font-body" style={{ color: "#424751" }}>
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: "#727782" }}>mail</span>
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all border"
                          style={{ backgroundColor: "#f9f9ff", borderColor: "#c2c6d3", color: "#191c20" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#125ca9"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(18,92,169,0.2)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#c2c6d3"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                      </div>
                    </div>

                    {/* Campo password → bcrypt hash → INSERT en `usuarios` */}
                    <div className="space-y-2">
                      <label htmlFor="reg-password" className="block text-sm font-medium font-body" style={{ color: "#424751" }}>
                        Contraseña
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: "#727782" }}>lock</span>
                        <input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                          className="w-full pl-10 pr-10 py-3 rounded-lg outline-none transition-all border"
                          style={{ backgroundColor: "#f9f9ff", borderColor: "#c2c6d3", color: "#191c20" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#125ca9"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(18,92,169,0.2)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#c2c6d3"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                        {/* Botón para mostrar/ocultar contraseña */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: "#727782" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#125ca9")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#727782")}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Botón submit → POST /api/auth/register → vuelve al login */}
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full font-headline font-semibold py-3 px-4 rounded-lg transition-all duration-150 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#125ca9", color: "#ffffff" }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#3875c3"; }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#125ca9"; }}
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          Crear Cuenta
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                      )}
                    </button>

                  </div>

                  {/* Cambia a la vista de Login */}
                  <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "#c2c6d3" }}>
                    <p className="text-sm" style={{ color: "#424751" }}>
                      ¿Ya tienes cuenta?{" "}
                      <button
                        onClick={() => { setIsLogin(true); setError(null); }}
                        className="font-semibold hover:underline decoration-2 underline-offset-4 ml-1"
                        style={{ color: "#125ca9" }}
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}