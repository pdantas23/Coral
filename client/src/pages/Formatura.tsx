import Diferenciais from "@/components/Diferenciais";
import DomeGallery from "@/components/DomeGallery";
import FadeInWhenVisible from "@/components/FadeInWhenVisible";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Instagram } from "lucide-react";


const GOLD     = "#C5A059";
const LINEN    = "#F4F1EE";
const CHARCOAL = "#2A2A2A";
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

export default function Formatura() {
  const openWA = () =>
    window.open(
      `https://wa.me/${WHATSAPP}?text=Quero saber mais sobre formaturas!`,
      "_blank"
    );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: LINEN, color: CHARCOAL }}
    >
      {/* Navbar em tema claro — "Formaturas" em dourado com sublinhado fixo */}
      <Navbar theme="light" />

      {/* ════════════ HERO — PEARL LUXURY ══════════════════════════════════════ */}
      <section
        className="relative w-screen h-screen flex flex-col items-center overflow-hidden"
        style={{ backgroundColor: LINEN }}
      >
        {/* Névoa dourada quente — spot de joalheria */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(197,160,89,0.07) 0%, transparent 68%)",
          }}
        />

        {/* ─── Texto ─── */}
        <div className="relative z-20 pt-24 sm:pt-40 px-8 sm:px-20 text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Título editorial */}
            <h1
              className="font-cormorant tracking-[-0.02em] leading-[0.9] sm:mb-8 uppercase"
              style={{ fontSize: "clamp(3rem, 9.5vw, 8rem)" }}
            >
              <span
                className="block not-italic font-semibold mb-1"
                style={{ color: CHARCOAL }}
              >
                Suas Conquistas
              </span>
              <span
                className="block italic font-light text-transparent"
                style={{ WebkitTextStroke: `1px ${GOLD}` }}
              >
                são Eternas.
              </span>
            </h1>
          </motion.div>
        </div>

        {/* ══ DomeGallery Mobile (≤ lg) ══════════════════════════════════════*/}
        <div className="lg:hidden relative w-full flex-1 min-h-[45vh] -mt-24 z-10">
          <DomeGallery
            fit={0.9}
            minRadius={360}
            maxVerticalRotationDeg={0}
            segments={24}
            dragDampening={3.5}
            overlayBlurColor={LINEN}
            grayscale={false}
          />

          {/* Névoa topo — gradiente sem transform, direção `to bottom` */}
          <div
            className="dome-fog absolute inset-x-0 top-0 pointer-events-none z-[30]"
            style={{
              height: "300px",
              background: `linear-gradient(to bottom, ${LINEN} 10%, ${LINEN} 65%, transparent 100%)`,
            }}
          />

          {/* Névoa base — espelho simétrico */}
          <div
            className="dome-fog absolute inset-x-0 bottom-0 pointer-events-none z-[30]"
            style={{
              height: "300px",
              background: `linear-gradient(to top, ${LINEN} 0%, ${LINEN} 65%, transparent 100%)`,
            }}
          />
        </div>

        {/* ─── DomeGallery Desktop (≥ lg) — maior, mais próximo do texto ─── */}
        <div className="hidden lg:block relative w-full h-full mb-8 -mt-8 z-10">
          <DomeGallery
            fit={1.45}
            minRadius={520}
            maxVerticalRotationDeg={0}
            segments={32}
            dragDampening={4}
            overlayBlurColor={LINEN}
            grayscale={false}
          />

          {/* Névoa topo desktop */}
          <div
            className="dome-fog absolute inset-x-0 top-0 pointer-events-none z-[30]"
            style={{
              height: "200px",
              background: `linear-gradient(to bottom, ${LINEN} 5%, transparent 100%)`,
            }}
          />

          {/* Névoa base desktop */}
          <div
            className="dome-fog absolute inset-x-0 bottom-0 pointer-events-none z-[30]"
            style={{
              height: "200px",
              background: `linear-gradient(to top, ${LINEN} 5%, transparent 100%)`,
            }}
          />
        </div>
      </section>

      {/* ─── DIFERENCIAIS ─────────────────────────────────────────────────── */}
      <Diferenciais />

      {/* ════════════ CTA — LEGADO ════════════════════════════════════════════ */}
      <section
        className="relative py-24 sm:py-24 px-8 text-center overflow-hidden"
        style={{ backgroundColor: LINEN }}
      >
        {/* Névoa muito sutil no centro */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(197,160,89,0.05) 0%, transparent 70%)",
          }}
        />

        <FadeInWhenVisible className="relative z-10 max-w-3xl mx-auto" duration={1.1} y={24}>
          {/* --- Título Editorial Emocional --- */}
          <h2
            className="font-serif leading-[1.1] tracking-tight mb-8"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
            }}
          >
            <span 
              className="block font-medium mb-2" 
              style={{ color: CHARCOAL }}
            >
              Seu esforço merece
            </span>
            <span
              className="block italic font-light"
              style={{ color: "#BFA16F" }} // Bronze Champagne: mais sofisticação, menos conflito
            >
              um desfecho à altura.
            </span>
          </h2>

          {/* Divisor dourado */}
          <div
            className="mx-auto mb-8"
            style={{ width: "2rem", height: "1px", backgroundColor: GOLD, opacity: 0.5 }}
          />

          {/* Subtexto */}
          <p
            className="font-inter font-light uppercase mx-auto mb-14"
            style={{
              fontSize: "10px",
              letterSpacing: "0.42em",
              color: "#9A9087",
              maxWidth: "28rem",
              lineHeight: 2,
            }}
          >
            Agende sua consultoria de design de experiência.
          </p>

          {/* ── Botão Liquid Fill ── */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={openWA}
              className={[
                "group relative overflow-hidden",
                "h-14 px-14",
                "font-inter font-semibold uppercase tracking-[0.22em] text-[11px]",
                "bg-[#C5A059] text-[#1A1A1A]",
                "border-none cursor-pointer rounded-none",
                "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:scale-[1.04] hover:shadow-[0_20px_60px_-12px_rgba(197,160,89,0.32)]",
              ].join(" ")}
            >
              <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
                Iniciar Planejamento
              </span>
              <span
                className="absolute inset-0 bg-[#1A1A1A] translate-y-full group-hover:translate-y-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              <span
                className={[
                  "absolute inset-0 flex items-center justify-center",
                  "font-inter font-semibold uppercase tracking-[0.22em] text-[11px] text-[#C5A059]",
                  "translate-y-full group-hover:translate-y-0",
                  "transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                ].join(" ")}
              >
                Iniciar Planejamento
              </span>
            </button>

            <button
              onClick={openWA}
              className="font-inter font-light uppercase transition-colors"
              style={{
                fontSize: "10px",
                letterSpacing: "0.4em",
                color: "#B0A898",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = "#B0A898")}
            >
              Consultoria exclusiva via WhatsApp
            </button>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-slate-100"  style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, backgroundColor: ` rgba(0, 0, 0, 0)`}}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <div className="w-full h-[1px] bg-[#C5A059]/50" />
          {/* Links com Ícones */}
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { 
                label: "Instagram", 
                icon: <Instagram size={18} color="#C5A059" />, 
                href: "https://www.instagram.com/forma.eventos",
                external: true 
              },
              { 
                label: "Corporativo", 
                icon: <Briefcase size={18} color="#C5A059" />, 
                href: "/corporativo", 
                external: false 
              },
              { 
                label: "Formaturas", 
                icon: <GraduationCap size={18} color="#C5A059" />, 
                href: "/formatura", 
                external: false 
              }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noopener noreferrer" : ""}
                className="flex items-center gap-2 text-sm font-medium transition-all hover:text-[#C5A059]"
                style={{ color: "#C5A059" }}
              >
                <span className="text-[#C5A059]">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Marca Registrada e Copyright */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs tracking-widest uppercase text-slate-400">
              © {new Date().getFullYear()} Forma Eventos — Todos os direitos reservados.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
