import { motion } from "framer-motion";
import FadeInWhenVisible from "./FadeInWhenVisible";

// ── Variantes para o efeito cascata ───────────────────────────────────────
// O container com staggerChildren propaga o timing aos filhos automaticamente.
const LIST_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,  // 100ms de intervalo entre cada card
      delayChildren:   0.15, // pequena pausa após o heading terminar
    },
  },
};

const CARD_VARIANTS = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ── Dados ──────────────────────────────────────────────────────────────────
const ITEMS = [
  {
    slug:    "parcerias",
    eyebrow: "Cenários Icônicos",
    desc:    "Seleção rigorosa dos espaços mais prestigiados do país.",
    img:     "/photos/IMG_3.jpg",
  },
  {
    slug:    "gastronomia",
    eyebrow: "Alta Gastronomia",
    desc:    "Menus exclusivos desenhados por grandes nomes da culinária.",
    img:     "/photos/buffet.jpg",
  },
  {
    slug:    "cenografia",
    eyebrow: "Design de Atmosfera",
    desc:    "Ambientes projetados para estimular os sentidos e a memória.",
    img:     "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900&q=85",
  },
  {
    slug:    "protocolo",
    eyebrow: "Logística Invisível",
    desc:    "Segurança e organização absoluta operando nos bastidores.",
    img:     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85",
  },
  {
    slug:    "legado",
    eyebrow: "Arte em Registro",
    desc:    "A imortalização da sua conquista em cada detalhe visual.",
    img:     "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=900&q=85",
  },
];

// ── Componente principal ───────────────────────────────────────────────────
export default function Diferenciais() {
  return (
    <section className="bg-[#EFECE6] py-10 sm:py-36 overflow-hidden">

      {/* Cabeçalho — FadeInWhenVisible simples */}
      <FadeInWhenVisible className="px-6 text-center mb-16 sm:mb-20" duration={1.0}>
        <span className="block text-[10px] tracking-[0.55em] uppercase text-[#C5A059] mb-5">
          A Curadoria do Ápice
        </span>
        <h2 className="font-cormorant italic text-4xl sm:text-5xl text-zinc-800 leading-[1.15] tracking-tight mb-6">
          O Padrão Forma.
        </h2>
        <div className="mx-auto w-12 h-px bg-[#C5A059]" />
      </FadeInWhenVisible>

      {/* ══ MOBILE: scroll horizontal + stagger em cascata ══ */}
      <motion.div
        className={[
          "flex gap-4 overflow-x-auto snap-x snap-mandatory",
          "px-6 scroll-pl-6",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          "lg:hidden",
        ].join(" ")}
        variants={LIST_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {ITEMS.map(item => (
          <motion.div
            key={item.slug}
            variants={CARD_VARIANTS}
            /* preserva layout do scroll horizontal */
            className="shrink-0 snap-start snap-always"
            style={{ width: "78vw" }}
          >
            <MobileCard item={item} />
          </motion.div>
        ))}
        <div className="shrink-0 w-2" aria-hidden />
      </motion.div>

      {/* ══ DESKTOP: grid 5 colunas + stagger em cascata ══ */}
      <motion.div
        className="hidden lg:grid grid-cols-5 gap-6 px-10 xl:px-20 max-w-[1600px] mx-auto"
        variants={LIST_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {ITEMS.map(item => (
          <motion.div key={item.slug} variants={CARD_VARIANTS}>
            <DesktopCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ── Mobile Card ────────────────────────────────────────────────────────────
function MobileCard({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <article>
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-200">
        <img src={item.img} alt={item.eyebrow} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-5 px-1">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C5A059] mb-1">{item.eyebrow}</p>
        <div className="w-5 h-px bg-[#C5A059]/40 mb-3" />
        <p className="text-sm text-zinc-600 leading-relaxed font-light">{item.desc}</p>
      </div>
    </article>
  );
}

// ── Desktop Card ───────────────────────────────────────────────────────────
function DesktopCard({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <article className="group flex flex-col">
      <div
        className={[
          "aspect-square w-full overflow-hidden rounded-2xl bg-zinc-200",
          "ring-1 ring-transparent group-hover:ring-[#C5A059]/50",
          "shadow-sm group-hover:shadow-[0_8px_32px_-8px_rgba(197,160,89,0.18)]",
          "transition-all duration-500 ease-out",
        ].join(" ")}
      >
        <img
          src={item.img}
          alt={item.eyebrow}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="mt-6 px-1">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C5A059] mb-1">{item.eyebrow}</p>

        <div className="relative h-px w-full mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-zinc-300" />
          <div className="absolute inset-y-0 left-0 w-full bg-[#C5A059] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </div>

        <p className="text-sm text-zinc-500 leading-relaxed font-light">{item.desc}</p>
      </div>
    </article>
  );
}
