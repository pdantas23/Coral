import { useAuth } from "@/features/auth/useAuth";
import { getDefaultRouteByRole } from "@/lib/roleRoutes";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "wouter";

// Forma Eventos Design System — Teal Principal, Purple Secundária
const COLORS = {
  TEAL: "#26C2B9",
  PURPLE: "#6019D2",
  BG_DARK: "#0B0819",
  BG_CARD: "#1A1127",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.70)",
  TEXT_MUTED: "rgba(255, 255, 255, 0.40)",
  BORDER: "rgba(38, 194, 185, 0.25)",
};

export default function Login() {
  const { login, isAuthenticated, profile, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectedRef                   = useRef(false);

  useEffect(() => {
    if (redirectedRef.current || loading || !isAuthenticated || !profile?.role) return;
    redirectedRef.current = true;
    setLocation(getDefaultRouteByRole(profile.role));
  }, [loading, isAuthenticated, profile, setLocation]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Email e senha são obrigatórios."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Email inválido."); return; }
    if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres."); return; }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result?.error) { setError("Email ou senha incorretos."); return; }
      const route = getDefaultRouteByRole(result?.profile?.role);
      if (route !== "/") { redirectedRef.current = true; setLocation(route); return; }
      setError("Seu perfil não está configurado. Contate o administrador.");
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isInitialLoading = loading && !isAuthenticated && !isSubmitting;

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "white" }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex justify-center items-center mb-5">
          <img 
            src="/icon.png" 
            alt="Logo Forma Eventos" 
            className="w-60 h-15 object-contain" 
          />
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-lg border"
          style={{
            backgroundColor: COLORS.PURPLE,
            borderColor: COLORS.BORDER,
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded text-xs font-light"
              style={{
                color: "#FF6B6B",
                borderLeft: `2px solid #FF6B6B`,
                backgroundColor: "rgba(255, 107, 107, 0.08)",
              }}
            >
              {error}
            </div>
          )}

          {/* Loading */}
          {isInitialLoading && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded text-xs"
              style={{ color: COLORS.TEXT_SECONDARY, backgroundColor: `rgba(38, 194, 185, 0.08)`, borderLeft: `2px solid ${COLORS.TEAL}` }}>
              <Loader2 className="h-3 w-3 animate-spin" style={{ color: COLORS.TEAL }} />
              Verificando sessão...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider font-light" style={{ color: COLORS.TEXT_PRIMARY }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isSubmitting || isInitialLoading}
                autoComplete="email"
                className="w-full bg-transparent outline-none text-sm px-0 pb-2 border-b"
                style={{
                  borderColor: COLORS.BORDER,
                  color: COLORS.TEXT_PRIMARY,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = COLORS.TEAL)}
                onBlur={e => (e.currentTarget.style.borderColor = COLORS.BORDER)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider font-light" style={{ color: COLORS.TEXT_PRIMARY }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting || isInitialLoading}
                  autoComplete="current-password"
                  className="w-full bg-transparent outline-none text-sm px-0 pb-2 pr-8 border-b transition-colors disabled:opacity-50"
                  style={{
                    borderColor: COLORS.BORDER,
                    color: COLORS.TEXT_PRIMARY,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = COLORS.TEAL)}
                  onBlur={e => (e.currentTarget.style.borderColor = COLORS.BORDER)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  disabled={isSubmitting || isInitialLoading}
                  className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-40 p-1"
                  style={{ color: COLORS.TEXT_SECONDARY, background: "none", border: "none" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isInitialLoading}
              className="w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: COLORS.TEAL,
                color: COLORS.TEXT_PRIMARY,
                border: "none",
                cursor: isSubmitting || isInitialLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => {
                if (!isSubmitting && !isInitialLoading) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              {isSubmitting ? "Autenticando..." : "Entrar"}
            </button>
          </form>

          {/* Footer text */}
          <p className="text-xs text-center mt-6 font-light" style={{ color: COLORS.TEXT_MUTED }}>
            Plataforma de Gestão Forma Eventos
          </p>
        </div>
      </div>
    </div>
  );
}
