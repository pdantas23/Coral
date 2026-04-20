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

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ backgroundColor: COLORS.PURPLE }}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center text-center px-8 py-12 rounded-lg border"
        style={{ backgroundColor: COLORS.TEAL, borderColor: COLORS.TEAL }}
      >
        {/* Brand */}
        <h1
          className="text-2xl font-bold uppercase tracking-widest mb-1"
          style={{ fontFamily: "'Poppins', sans-serif", color: COLORS.PURPLE }}
        >
          Forma
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] mb-8" style={{ color: "white" }}>
          Eventos
        </p>

        {/* 404 */}
        <div className="mb-8">
          <p
            className="font-light leading-none mb-4"
            style={{
              fontSize: "5rem",
              color: COLORS.PURPLE,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            404
          </p>
        </div>

        {/* Message */}
        <h2
          className="font-bold mb-3 text-lg"
          style={{ fontFamily: "'Poppins', sans-serif", color: COLORS.TEXT_PRIMARY }}
        >
          Página não encontrada
        </h2>
        <p
          className="font-light mb-8 leading-relaxed text-sm"
          style={{ color: COLORS.TEXT_SECONDARY }}
        >
          A página que você procura não existe ou foi removida. Retorne ao início da plataforma.
        </p>

        {/* Action Button */}
        <button
          onClick={() => setLocation("/")}
          className="px-8 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            backgroundColor: "white",
            color: COLORS.PURPLE,
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
