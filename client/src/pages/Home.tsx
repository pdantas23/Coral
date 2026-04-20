import Navbar from "@/components/Navbar";
import CircularTestimonials, { type TestimonialItem } from "@/components/ui/circular-testimonials";
import { Briefcase, GraduationCap, Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";
const MAPS_URL = "https://maps.google.com/?q=Av.+Lindolfo+Monteiro,+541";

const FORMA_PURPLE = "#6019D2";    // Roxo Imperial (Base)
const FORMA_TEAL = "#26C2B9";      // Verde Água (Destaque/Acento)
const FORMA_DARK = "#0B0819";      // Fundo Ultra Dark

function wa(msg: string) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
    "_blank",
    "noopener,noreferrer"
  );
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BORDER_GOLD = "rgb(191, 161, 111)";

// ─── Cards de navegação de eventos ─────────────────────────────────────────────
const EVENT_CARDS = [
  {
    title: "Eventos\nCorporativos",
    label: "CORPORATIVO",
    href: "/corporativo",
    // Gradiente placeholder — substitua src pela imagem real
    src: "https://centerconvention.com.br/wp-content/uploads/2024/10/L8A7275.jpg",
    accent: "rgb(191, 161, 111)",
  },
  {
    title: "Formaturas",
    label: "FORMATURAS",
    href: "/formatura",
    src: "/photos/IMG_2.jpg",
    accent: FORMA_PURPLE,
  },
  {
    title: "Outras\nCelebrações",
    label: "CELEBRAÇÕES",
    href: "/eventos-exclusivos",
    src: "/photos/IMG_3.jpg",
    accent: FORMA_PURPLE,
  },
] as const;

// ─── Card de evento individual ─────────────────────────────────────────────────
function EventCard({
  title,
  label,
  href,
  src,
  accent,
}: (typeof EVENT_CARDS)[number]) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className="event-card block relative overflow-hidden"
      style={{
        borderRadius: "14px",
        border: hovered
          ? `1px solid ${"#26C2B9"}`
          : `1px solid ${"#26C2B9"}`,
        boxShadow: hovered
          ? `0 0 28px -4px ${accent}55, 0 8px 32px rgba(0,0,0,0.5)`
          : "0 4px 24px rgba(0,0,0,0.4)",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
        aspectRatio: "3/4",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem de fundo com zoom no hover */}
      <div
        className="absolute inset-0"
        style={{
          transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: hovered ? "scale(1.07)" : "scale(1)",
        }}
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          style={{
            transition: "opacity 0.55s ease",
          }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Overlay gradiente — mais intenso na base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(4,3,12,0.95) 0%, rgba(4,3,12,0.55) 45%, rgba(4,3,12,0.10) 100%)",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Borda interna decorativa — aparece no hover */}
      <div
        className="absolute inset-[10px] rounded-[8px] pointer-events-none"
        style={{
          border: `1px solid ${"#26C2B9"}`,
          opacity: hovered ? 0.30 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex flex-col justify-end p-7">
        <h3
          className="font-bold leading-tight"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            color: "#FFFFFF",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            /* Força uma única linha e corta o excesso com reticências (...) */
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%"
          }}
        >
          {title}
        </h3>

        {/* CTA inline */}
        <div
          className="flex items-center gap-2 mt-4"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.30s ease, transform 0.30s ease",
          }}
        >
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "#26C2B9" }}
          >
            Saiba mais
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-3.5 h-3.5"
            style={{ color: "#26C2B9" }}
          >
            <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

      </div>
    </a>
  );
}

// ─── Dados do carrossel mobile ─────────────────────────────────────────────────
const CAROUSEL_ITEMS: TestimonialItem[] = [
  {
    name: "Eventos Corporativos",
    designation: "Corporativo",
    quote: "Confraternizações, lançamentos e convenções com produção completa e equipe dedicada ao sucesso do seu negócio.",
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  },
  {
    name: "Formaturas",
    designation: "Formaturas",
    quote: "Anos de dedicação merecem uma celebração à altura. Cada detalhe planejado para que você viva este momento.",
    src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&q=80",
  },
  {
    name: "Eventos Exclusivos",
    designation: "Celebrações",
    quote: "Casamentos, festas privadas e celebrações de luxo com infraestrutura de ponta e atenção irrestrita.",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  },
];

// ─── Seção completa de cards ───────────────────────────────────────────────────
function EventCardsSection() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor:  FORMA_TEAL}}>
      <div className="max-w-6xl mx-auto">

        {/* Divisor de seção */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1" style={{ backgroundColor: FORMA_PURPLE }} />
          <span
            className="text-xs font-semibold tracking-[0.45em] uppercase"
            style={{ color: FORMA_PURPLE }}
          >
            Nossos Eventos
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: FORMA_PURPLE }} />
        </div>

        {/* Título da seção */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            O que{" "}
            <span style={{ color: FORMA_PURPLE }}>criamos</span>{" "}
            para você
          </h2>
          <p
            className="mt-3 text-sm font-light max-w-md mx-auto"
            style={{ color: "white" }}
          >
            Escolha o tipo de evento e conheça cada experiência em detalhe.
          </p>
        </div>

        {/* ── Desktop: grid 3 colunas ─────────────────────────────────────── */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 lg:gap-6">
          {EVENT_CARDS.map((card) => (
            <EventCard key={card.href} {...card} />
          ))}
        </div>

        {/* ── Mobile: carrossel 3D ────────────────────────────────────────── */}
        <div className="block sm:hidden">
          <CircularTestimonials
            testimonials={CAROUSEL_ITEMS}
            autoplay={false}
            colors={{
              name:                "#FFFFFF",
              designation:         "rgb(191, 161, 111)",
              testimony:           "rgba(255,255,255,0.72)",
              arrowBackground:     "rgba(191,161,111,0.12)",
              arrowForeground:     "rgb(191, 161, 111)",
              arrowHoverBackground:"rgba(191,161,111,0.25)",
            }}
            fontSizes={{
              name:        "1.25rem",
              designation: "0.70rem",
              quote:       "0.875rem",
            }}
          />
        </div>

      </div>
    </section>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Home() {
       // Fundo Ultra Dark

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: FORMA_PURPLE, color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />

      {/* ═══════════ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>

        {/* Fotografia de fundo com overlay roxo profundo da marca */}
        <div
          className="absolute inset-0 z-0"
          style={{
            /* Gradiente Direcional: do Roxo Elétrico para o Dark, com um toque de Roxo Imperial no meio */
            background: FORMA_PURPLE,
          }}
        >
          {/* Glow extra para profundidade (opcional) */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 20% 30%, rgba(96, 25, 210, 0.4) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pt-1 gap-6 max-w-4xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tighter"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Transformamos eventos em experiências{" "}
            <span style={{ 
              color: FORMA_TEAL, 
              textShadow: `0 0 30px rgba(38, 194, 185, 0.4)` 
            }}>inesquecíveis.</span>
          </h1>

          <p
            className="text-lg font-light leading-relaxed max-w-xl"
            style={{ color: "rgba(255,255,255,0.70)", fontFamily: "'Inter', sans-serif" }}
          >
            Produção completa para formaturas e eventos corporativos que exigem <span className="font-medium text-white">impacto e sofisticação.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center items-center">
            <button
              id="hero-cta-whatsapp"
              className="font-bold cursor-pointer"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "10px", 
                padding: "16px 0", // Padding vertical fixo, horizontal controlado pela largura
                fontSize: "0.95rem",
                backgroundColor: "green", 
                color: "white",
                borderRadius: "50px", 
                boxShadow: `0 10px 25px -5px rgba(38, 194, 185, 0.4)`,
                width: "100%",      // Mobile ocupa tudo
                maxWidth: "300px"   // Desktop tamanho fixo igual
              }}
              onClick={() => wa("Olá! Vim pelo site da Forma Eventos e gostaria de saber mais.")}
            >
              <MessageCircle size={19} fill="currentColor" />
              <span className="whitespace-nowrap">Falar com um consultor</span>
            </button>

            <a
              id="hero-cta-orcamento"
              href="/eventos-exclusivos"
              className="font-medium text-center transition-all hover:bg-white/10"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "10px", 
                padding: "16px 0", 
                fontSize: "0.95rem",
                backgroundColor: FORMA_TEAL, 
                color: FORMA_PURPLE,
                border: "1px solid rgba(255,255,255,0.2)", 
                borderRadius: "50px",
                backdropFilter: "blur(10px)",
                width: "100%",      // Mobile ocupa tudo
                maxWidth: "300px"   // Desktop tamanho fixo igual
              }}
            >
              <span className="whitespace-nowrap">Solicitar orçamento</span>
            </a>
          </div>
        </div>
      </section>

      {/*Transicao*/}
      <div className="w-full overflow-hidden leading-[0] bg-[#26C2B9]"> {/* Cor da section 2 */}
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[60px]"
          style={{ fill: FORMA_PURPLE }} /* Cor da section 1 */
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.32,37.5,110.12,32.07,230,22,332.18-20,93.66-38.49,170.81-68.86,284.7-61.12V0Z"></path>
        </svg>
      </div>
      
      <EventCardsSection />

      {/* Transicao */}
      <div className="w-full overflow-hidden leading-[0]" style={{ fill: FORMA_PURPLE }}> {/* Cor da section 2 */}
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[60px]"
          style={{ fill: FORMA_TEAL }} /* Cor da section 1 */
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.32,37.5,110.12,32.07,230,22,332.18-20,93.66-38.49,170.81-68.86,284.7-61.12V0Z"></path>
        </svg>
      </div>
      
      {/* ═══ EQUIPE / SOBRE NÓS ══════════════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ backgroundColor: FORMA_PURPLE}}>
        <div className="max-w-6xl mx-auto">

          <div className="mb-12 flex items-center gap-4">
            <div className="h-[2px] w-12" style={{ backgroundColor: FORMA_TEAL }} />
            <span className="text-xs font-bold tracking-[0.5em] uppercase" style={{ color: FORMA_TEAL }}>
              DNA Forma
            </span>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2"
            style={{borderRadius: "24px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.02)" }}
            >
            <div
              className="relative overflow-hidden group"
              style={{ minHeight: "500px"}}
            >
              <img
                src="/photos/IMG_4.jpg"
                alt="Equipe Forma Eventos"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
            </div>

            <div className="flex flex-col justify-center gap-6 p-10 lg:p-16" style={{ backgroundColor: FORMA_TEAL }}>
              <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Uma equipe que vive <br/>
                <span style={{ color: FORMA_TEAL }}>para fazer acontecer.</span>
              </h2>
              <div className="space-y-6 text-base font-light leading-relaxed" style={{ color: "white" }}>
                <p>
                  A <strong className="text-white">Forma Eventos</strong> nasceu para quebrar o padrão das produções tradicionais. Somos especialistas em logística de alta complexidade.
                </p>
                <p>
                  Do planejamento estratégico à execução técnica, nosso time garante que o único papel do cliente seja viver o momento. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*Transicao*/}
      <div className="w-full overflow-hidden leading-[0] bg-[#26C2B9]"> {/* Cor da section 2 */}
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[60px]"
          style={{ fill: FORMA_PURPLE }} /* Cor da section 1 */
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.32,37.5,110.12,32.07,230,22,332.18-20,93.66-38.49,170.81-68.86,284.7-61.12V0Z"></path>
        </svg>
      </div>

      {/* ═══ LOCALIZAÇÃO ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ backgroundColor: FORMA_TEAL}}>
        <div className="max-w-6xl mx-auto">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-0"
            style={{ border: `1px solid rgba(255,255,255,0.08)`, borderRadius: "24px", overflow: "hidden" }}
          >
            <div className="flex flex-col justify-center gap-8 p-10 lg:p-16" style={{ backgroundColor: FORMA_PURPLE }}>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: FORMA_TEAL }}>Sede Teresina</span>
                <h2 className="text-3xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Venha nos visitar
                </h2>
              </div>
              
              <p className="text-xl font-light" style={{ color: "rgba(255,255,255,0.8)" }}>
                Av. Lindolfo Monteiro, 541 <br/>
                Fátima, Teresina - PI
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="px-8 py-4 rounded-xl font-bold transition-all hover:bg-teal-500 hover:text-white"
                  style={{ backgroundColor: "transparent", border: `2px solid ${FORMA_TEAL}`, color: FORMA_TEAL }}
                  onClick={() => wa("Olá! Gostaria de agendar uma visita.")}>
                  Agendar Visita
                </button>
              </div>
            </div>

            <div className="h-80 lg:h-auto min-h-[400px]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.246476104443!2d-42.7885233!3d-5.0635465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x78e38d0e7f777777%3A0x7777777777777777!2sAv.%20Lindolfo%20Monteiro%2C%20541!5e0!3m2!1spt-BR!2sbr!4v1700000000000`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-slate-100"  style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, backgroundColor: FORMA_DARK }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          {/* Links com Ícones */}
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { 
                label: "Instagram", 
                icon: <Instagram size={18} />, 
                href: "https://www.instagram.com/forma.eventos",
                external: true 
              },
              { 
                label: "Corporativo", 
                icon: <Briefcase size={18} />, 
                href: "/corporativo", 
                external: false 
              },
              { 
                label: "Formaturas", 
                icon: <GraduationCap size={18} />, 
                href: "/formatura", 
                external: false 
              }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noopener noreferrer" : ""}
                className="flex items-center gap-2 text-sm font-medium transition-all hover:text-[#26C2B9]"
                style={{ color: "white" }}
              >
                <span className="text-[#26C2B9]">{item.icon}</span>
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
    
      {/* ── WhatsApp flutuante — glow premium ─────────────────────────────── */}
      <button
        onClick={() => wa("Olá! Vim pelo site da Forma Eventos e gostaria de mais informações.")}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 wa-float"
        style={{
          backgroundColor: "#25D366",
          color: "#FFFFFF",
          border: "1.5px solid rgba(255,255,255,0.18)",
        }}
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

    </div>
  );
}
