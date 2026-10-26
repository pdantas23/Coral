import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { getDefaultRouteByRole } from "@/lib/roleRoutes";

// ─── Paleta Coral ─────────────────────────────────────────────────────────────
const C = {
  red1:    "#FD6E5E",
  red2:    "#CC4834",
  pink1:   "#FEEDED",
  pink2:   "#FFADA2",
  noir:    "#333333",
  bege1:   "#EDE8E1",
  bege2:   "#DED6BF",
  bege3:   "#C8C1AC",
  owhite:  "#FAF5ED",
  white:   "#FFFFFF",
} as const;

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
      style={{ backgroundColor: C.owhite, fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center mb-1">
          <div className="h-36 w-36 md:h-50 md:w-50 shrink-0">
                <img
                  src="/logo2.png"
                  alt="Coral Acessórios Logo"
                  className="h-full w-full object-contain"
                />
              </div>
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: C.red1, opacity: 0.4 }} />
          <p className="mt-2 text-[10px] font-light tracking-[0.3em] uppercase" style={{ color: C.bege3 }}>
            Área restrita
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white p-8 sm:p-10 rounded-xl"
          style={{ border: `1px solid ${C.bege2}`, boxShadow: "0 8px 32px rgba(253,110,94,0.08)" }}
        >
          {error && (
            <div
              className="mb-6 p-3 text-xs font-light rounded-md"
              style={{ backgroundColor: C.pink1, color: C.red2, border: `1px solid ${C.pink2}` }}
            >
              {error}
            </div>
          )}

          {isInitialLoading && (
            <div className="mb-6 flex items-center gap-2 p-3 text-xs font-light rounded-md"
              style={{ backgroundColor: C.bege1, color: C.bege3 }}>
              <Loader2 className="h-3 w-3 animate-spin" style={{ color: C.red1 }} />
              Verificando sessão...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[9px] tracking-[0.35em] uppercase font-light mb-2" style={{ color: C.bege3 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isSubmitting || isInitialLoading}
                autoComplete="email"
                className="w-full py-2.5 px-3 text-sm font-light outline-none transition rounded-md"
                style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                onFocus={(e) => (e.target.style.borderColor = C.red1)}
                onBlur={(e) => (e.target.style.borderColor = C.bege2)}
              />
            </div>

            <div>
              <label className="block text-[9px] tracking-[0.35em] uppercase font-light mb-2" style={{ color: C.bege3 }}>
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
                  className="w-full py-2.5 px-3 pr-10 text-sm font-light outline-none transition rounded-md"
                  style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                  onFocus={(e) => (e.target.style.borderColor = C.red1)}
                  onBlur={(e) => (e.target.style.borderColor = C.bege2)}
                />
                <button
                  type="button" onClick={() => setShowPassword((p) => !p)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-50"
                  style={{ color: C.bege3, background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isSubmitting || isInitialLoading}
              className="w-full py-3 text-[11px] font-medium tracking-[0.3em] uppercase transition hover:opacity-85 disabled:opacity-40 rounded-md mt-2"
              style={{
                background: `linear-gradient(135deg, ${C.red1} 0%, ${C.red2} 100%)`,
                color: C.white,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(253,110,94,0.25)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] font-light" style={{ color: C.bege3 }}>
            Contate o administrador caso não tenha acesso
          </p>
        </div>
      </div>
    </div>
  );
}
