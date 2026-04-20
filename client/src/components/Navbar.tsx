// ─── Navbar Global — Forma Eventos ────────────────────────────────────────────
// Props:  theme="dark" (default, fundo escuro) | theme="light" (Formatura)
// Desktop: FORMA centralizado + 4 links abaixo
// Mobile:  FORMA centralizado · ícone à direita → drawer sempre escuro

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const GOLD   = "#C5A059";
const BORDER_GOLD = "rgba(197,160,89,0.18)";

const THEMES = {
  dark: {
    logo:      "#FFFFFF",
    linkIdle:  "rgba(255,255,255,0.52)",
    linkHover: GOLD,
    hamburger: GOLD,
  },
  light: {
    logo:      "#2A2A2A",
    linkIdle:  "rgba(42,42,42,0.45)",
    linkHover: "#2A2A2A",
    hamburger: "#2A2A2A",
  },
} as const;

const NAV_LINKS = [
  { label: "A Forma",            href: "/"            },
  { label: "Corporativo",        href: "/corporativo" },
  { label: "Formaturas",         href: "/formatura"   },
  { label: "Eventos Exclusivos", href: "/eventos-exclusivos" },
] as const;

interface NavbarProps {
  theme?: "dark" | "light";
}

export default function Navbar({ theme = "dark" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const T = THEMES[theme];

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      {/* ═══ NAVBAR — absolute, some com o scroll ════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 }}
      >

        {/* ── Desktop: duas linhas centradas ──────────────────────────────── */}
        <div
          className="hidden sm:flex flex-col items-center justify-center w-full"
          style={{ padding: "22px 32px", gap: "8px" }}
        >
          {/* Logotipo */}
          <div className="text-center">
          <img 
            src="/favicon.png" 
            alt="Logo Forma Eventos" 
            className="w-40 h-6 object-contain" 
          />
        </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = location === href || (href === "/" && location === "");
              return (
                <a
                  key={href}
                  href={href}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 300,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color:        isActive ? GOLD : T.linkIdle,
                    borderBottom: isActive ? `1px solid ${GOLD}` : "1px solid transparent",
                    paddingBottom: "2px",
                    transition: "color 0.25s ease, border-color 0.25s ease",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = T.linkHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = T.linkIdle;  }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Mobile: FORMA centralizado · ícone à direita ────────────────── */}
        <div
          className="flex sm:hidden items-center justify-center w-full"
          style={{ padding: "18px 24px", position: "relative" }}
        >
          <a
            href="/"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: T.logo,
              textDecoration: "none",
              userSelect: "none",
            }}
          >
            Forma
          </a>

          <button
            id="nav-mobile-menu-toggle"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen(true)}
            style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "7px",
              padding: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "1px", backgroundColor: T.hamburger }} />
            <span style={{ display: "block", width: "14px", height: "1px", backgroundColor: T.hamburger }} />
          </button>
        </div>
      </motion.nav>

      {/* ═══ DRAWER MOBILE — sempre escuro ════════════════════════════════════ */}

      <div
        className="sm:hidden fixed inset-0 z-[60] transition-opacity duration-300"
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        style={{
          backgroundColor: "rgba(4,3,12,0.80)",
          backdropFilter: "blur(4px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      />

      <div
        className="sm:hidden fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
        style={{
          width: "68vw",
          maxWidth: "280px",
          backgroundColor: "rgba(8,6,18,0.99)",
          borderLeft: `1px solid ${BORDER_GOLD}`,
          padding: "28px 24px",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <button
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          style={{
            alignSelf: "flex-end",
            marginBottom: "36px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            opacity: 0.5,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="#FFFFFF" strokeWidth={1}
            style={{ width: "18px", height: "18px" }}>
            <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round" />
          </svg>
        </button>

        <span style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
          marginBottom: "36px",
          display: "block",
        }}>
          Forma
        </span>

        <nav style={{ display: "flex", flexDirection: "column" }}>
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = location === href || (href === "/" && location === "");
            return (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  color: isActive ? GOLD : "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  padding: "13px 0",
                  borderBottom: `1px solid ${BORDER_GOLD}`,
                  transition: "color 0.2s ease",
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
