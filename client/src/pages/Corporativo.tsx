import Navbar from "@/components/Navbar";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Briefcase, ChevronLeft, ChevronRight, FileText, GraduationCap, Instagram, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Configurações de Estilo & Tokens ────────────────────────────────────────
const BG = "#0B0B0F";
const TEXT_PRIMARY = "#E5E7EB"; 

const ease = [0.22, 1, 0.36, 1] as const;

// ─── Dados ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80", title: "Convenções de Liderança" },
  { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80", title: "Jantares de Gala" },
  { src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400&q=80", title: "Lançamentos de Marca" },
];

const TESTIMONIALS = [
  {
    quote: "A Forma traduziu nossa visão estratégica em um evento impecável. O rigor logístico e o cuidado com a experiência dos convidados elevaram o patamar da nossa convenção anual.",
    name: "Ricardo Oliveira",
    role: "Diretor de Marketing · TechCorp"
  },
  {
    quote: "Profissionalismo raro. Eles não apenas executam, eles fazem a curadoria de cada detalhe. O resultado final foi um reflexo fiel do nosso posicionamento premium.",
    name: "Beatriz Helena",
    role: "CEO · Studio Design"
  }
];

// ─── Componentes Auxiliares ──────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Corporativo() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

  const openWA = () => {
    const message = encodeURIComponent("Olá! Vim pelo site e gostaria de solicitar uma consultoria para um evento corporativo.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(timer); // Limpa o timer ao desmontar a página
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: BG, color: TEXT_PRIMARY }}>
      <Navbar />

      {/* ════════════ HERO SECTION ════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-tight mb-6 mt-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Onde a estratégia <br />
              <span className="italic font-extralight text-gray-500">encontra a celebração.</span>
            </h1>
            <p className="text-base sm:text-lg font-light text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Gestão de produção e experiência de marca para eventos corporativos que consolidam resultados e fortalecem culturas organizacionais de alto padrão.
            </p>

            <div className="flex flex-row justify-center gap-4">
              {/* Botão 1: WhatsApp (Consultoria) */}
              <button 
                onClick={() => {
                  const msg = encodeURIComponent("Olá! Gostaria de uma consultoria para um evento corporativo.");
                  window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${msg}`, "_blank");
                }}
                className="h-12 w-48 rounded-full bg-[#E5E7EB] text-[#0B0B0F] text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:bg-white transition-all cursor-pointer"
              >
                <MessageCircle size={14} /> 
                Consultoria
              </button>

              {/* Botão 2: Página de Orçamentos (Projeto) */}
              <a 
                href="/eventos-exclusivos" 
                className="h-12 w-48 rounded-full border border-white/20 text-[11px] uppercase tracking-[0.2em] font-light hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer no-underline text-inherit"
              >
                <FileText size={14} strokeWidth={1.5} /> 
                <span>Solicitar Projeto</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ MANIFESTO & MEDIA ═══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-light mb-6">A excelência não é um ato, mas um hábito.</h2>
              <p className="text-gray-500 font-light leading-loose max-w-2xl mx-auto">
                Na Forma, transformamos visões corporativas em experiências sensoriais. Nossa abordagem combina rigor logístico com uma curadoria estética que comunica autoridade e prestígio em cada detalhe.
              </p>
            </div>
          </FadeUp>

          {/* Carrossel de Mídia */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl aspect-video max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={SLIDES[currentSlide].src}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* ════════════ VALORES ═══════════════════════════════ */}
      <section className="py-40 bg-[#030303] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-serif italic text-zinc-100 leading-tight mb-8">
            A convergência entre a visão estratégica <br /> e o espetáculo monumental.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-500 font-light leading-relaxed tracking-[0.1em] max-w-2xl mx-auto">
            Projetamos eventos corporativos que transcendem a logística convencional. 
            Cada detalhe é uma peça de engenharia social e estética, desenhada para 
            consolidar o prestígio da sua marca e transformar o agora em um 
            patrimônio histórico de experiências memoráveis.
          </p>

          {/* Botões de Ação */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={openWA}
              className="w-full sm:w-auto px-10 h-14 bg-[#D4AF37] text-black text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#b8952d] transition-all duration-500 cursor-pointer"
            >
              Agendar Consultoria
            </button>

            <button 
              onClick={() => window.location.href = '/formulario'}
              className="w-full sm:w-auto px-10 h-14 border border-zinc-800 text-zinc-300 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-all duration-500 cursor-pointer"
            >
              Solicitar Proposta
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ DEPOIMENTOS ═══════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="border border-white/10 rounded-2xl p-10 sm:p-16 relative bg-white/[0.02]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xl sm:text-2xl font-light italic leading-loose text-gray-300 mb-8">
                    "{TESTIMONIALS[currentTestimonial].quote}"
                  </p>
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.3em] font-medium" style={{ color: "rgb(191, 161, 111)" }}>
                      {TESTIMONIALS[currentTestimonial].name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.1em] text-gray-600 mt-1">
                      {TESTIMONIALS[currentTestimonial].role}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navegação Manual */}
              <div className="flex gap-4 mt-12">
                <button 
                  onClick={() => setCurrentTestimonial(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="p-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <button 
                  onClick={() => setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length)}
                  className="p-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
                >
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════ FINAL CTA ═══════════════════════════════════════════════════ */}
      <section className="py-24 text-center px-6">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 
              className="text-3xl sm:text-5xl font-light tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Pronto para dar o <br className="sm:hidden" />
              <span className="italic font-extralight text-gray-500">próximo passo?</span>
            </h2>
            <div className="w-12 h-[1px] mx-auto mt-6 mb-2" style={{ backgroundColor: "rgba(191,161,111,0.35)" }} />
          </div>

          <div className="flex flex-row justify-center items-center gap-2 sm:gap-4">
            {/* Botão 1: Falar com Consultor */}
            <button
              onClick={openWA}
              className="h-11 sm:h-14 px-4 sm:px-10 rounded-full bg-white/5 border border-white/10 hover:border-[rgba(191,161,111,0.5)] transition-all flex items-center justify-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: "rgb(191, 161, 111)" }} />
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium whitespace-nowrap">
                Falar com Consultor
              </span>
            </button>

            {/* Botão 2: Solicitar Orçamento */}
            <button
              onClick={() => window.location.href = '/eventos-exclusivos'}
              className="h-11 sm:h-14 px-4 sm:px-10 rounded-full bg-white text-black flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
            >
              <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium whitespace-nowrap">
                Solicitar Orçamento
              </span>
            </button>
          </div>
        </FadeUp>
      </section>

      <footer className="py-12 px-6 border-t border-slate-100"  style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, backgroundColor: ` rgba(0, 0, 0, 0)`}}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          {/* Links com Ícones */}
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { 
                label: "Instagram", 
                icon: <Instagram size={18} color="white" />, 
                href: "https://www.instagram.com/forma.eventos",
                external: true 
              },
              { 
                label: "Corporativo", 
                icon: <Briefcase size={18} color="white" />, 
                href: "/corporativo", 
                external: false 
              },
              { 
                label: "Formaturas", 
                icon: <GraduationCap size={18} color="white" />, 
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
    </div>
  );
}