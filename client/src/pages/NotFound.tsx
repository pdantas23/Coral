import { useLocation } from "wouter";

// ─── Paleta Coral ─────────────────────────────────────────────────────────────
const C = {
  red1:    "#FD6E5E",
  red2:    "#CC4834",
  pink1:   "#FEEDED",
  noir:    "#333333",
  bege2:   "#DED6BF",
  bege3:   "#C8C1AC",
  owhite:  "#FAF5ED",
  white:   "#FFFFFF",
} as const;

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center"
      style={{ backgroundColor: C.owhite, fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div
        className="mx-4 w-full max-w-md flex flex-col items-center text-center p-12 bg-white rounded-2xl"
        style={{ border: `1px solid ${C.bege2}`, boxShadow: "0 8px 32px rgba(253,110,94,0.08)" }}
      >
        {/* Wordmark */}
        <span
          className="text-3xl font-black tracking-tight leading-none mb-0.5"
          style={{
            color: C.red1,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.03em",
          }}
        >
          CORAL
        </span>
        <span className="text-[9px] font-light tracking-[0.5em] uppercase mb-8" style={{ color: C.bege3 }}>
          Acessórios
        </span>

        <div className="w-10 h-[2px] rounded-full mb-8" style={{ backgroundColor: C.red1, opacity: 0.35 }} />

        {/* 404 */}
        <p
          className="text-7xl font-black mb-3 leading-none"
          style={{
            color: C.pink1,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </p>
        <p className="text-sm font-medium mb-2" style={{ color: C.noir }}>Página não encontrada</p>
        <p className="text-xs font-light leading-relaxed mb-10" style={{ color: C.bege3 }}>
          A página que você está procurando não existe ou foi removida.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="text-[11px] font-medium tracking-[0.3em] uppercase px-8 py-3 transition hover:opacity-85 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${C.red1} 0%, ${C.red2} 100%)`,
            color: C.white,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(253,110,94,0.25)",
          }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
