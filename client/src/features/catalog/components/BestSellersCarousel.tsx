import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { carregarCatalogoPublico } from "@/features/catalog/catalogApi";
import { CATEGORY_LABELS, type Product } from "@/features/catalog/catalogTypes";
import ProductCard from "@/components/ProductCard";
import { faixaDePreco } from "@/features/catalog/variantUtils";
import { selecionarDestaques, selecionarVitrine } from "@/features/catalog/vitrine";
import { DESTAQUES, ITENS_POR_VITRINE, VITRINES } from "@/config/vitrines";
import ProductModal from "@/features/catalog/components/ProductModal";

// ─── Brand palette (mirrors Home.tsx) ────────────────────────────────────────
const C = {
  red1:   "#FD6E5E",
  red2:   "#CC4834",
  noir:   "#333333",
  bege1:  "#EDE8E1",
  bege2:  "#DED6BF",
  bege3:  "#C8C1AC",
  white:  "#FFFFFF",
} as const;

// ─── BestSellersCarousel ──────────────────────────────────────────────────────

export default function BestSellersCarousel() {
  const [todos, setTodos] = useState<Product[]>([]);
  const [aberto, setAberto] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    carregarCatalogoPublico()
      .then((res) => { if (ativo) { setTodos(res.data); setLoading(false); } })
      .catch(() => { if (ativo) { setTodos([]); setLoading(false); } });
    return () => { ativo = false; };
  }, []);

  // Destaques: config/vitrines.ts (DESTAQUES). Sem repetir o que está nos
  // blocos de Brincos e Anéis logo abaixo.
  const products = useMemo(() => {
    const nosBlocos = new Set(
      VITRINES.flatMap((v) => selecionarVitrine(todos, v.categoria, v.slugs, ITENS_POR_VITRINE)).map((p) => p.id)
    );
    return selecionarDestaques(todos, DESTAQUES.slugs, nosBlocos, DESTAQUES.categorias, DESTAQUES.total);
  }, [todos]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [aberto]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  // Mede as setas quando o trilho aparece e sempre que a largura dele ou do
  // conteúdo muda. Antes a medida dependia só de products.length: ao voltar
  // para a Home, o catálogo já vem do cache, a lista chega num render em que
  // `loading` ainda é true (o trilho não existe) e o efeito não rodava de novo
  // quando o trilho aparecia. A seta "Próximo" ficava desabilitada para sempre.
  const mostrar = !loading && products.length > 0;
  useEffect(() => {
    const el = trackRef.current;
    if (!mostrar || !el) return;
    el.scrollLeft = 0;
    setCanScrollLeft(false);
    updateScrollState();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    // As fotos chegam depois e podem mudar a largura dos cards.
    const t = setTimeout(updateScrollState, 300);
    return () => { ro?.disconnect(); clearTimeout(t); };
  }, [mostrar, products.length, updateScrollState]);

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    if (!card) return;
    el.scrollBy({ left: card.offsetWidth * direction, behavior: "smooth" });
  }

  if (!mostrar) return null;

  const seta = (dir: 1 | -1, ativo: boolean) => (
    <button
      onClick={() => scrollByCards(dir)}
      disabled={!ativo}
      className="hidden sm:flex shrink-0 w-11 h-11 2xl:w-12 2xl:h-12 rounded-full items-center justify-center transition-all duration-200 self-center"
      style={{
        background: C.white,
        border: `1px solid ${C.bege2}`,
        color: C.noir,
        opacity: ativo ? 1 : 0.35,
        cursor: ativo ? "pointer" : "default",
        boxShadow: ativo ? "0 8px 24px rgba(253, 110, 94, 0.15)" : "none",
      }}
      aria-label={dir === -1 ? "Produto anterior" : "Próximo produto"}
    >
      {dir === -1 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    // Em telas grandes o carrossel sai da coluna de 1024 px da Home e cresce
    // até 1440 px (centralizado), mantendo 4 cards: os cards ficam maiores.
    <section className="relative left-1/2 w-full -translate-x-1/2 lg:w-[min(calc(100vw-48px),1240px)] 2xl:w-[min(calc(100vw-64px),1440px)]">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="text-center mb-10 sm:mb-12">
        <p
          className="text-[9px] tracking-[0.5em] uppercase font-light mb-3"
          style={{ color: C.red1 }}
        >
          Coleção
        </p>
        <h2
          className="text-2xl sm:text-4xl font-bold leading-tight"
          style={{
            color: C.noir,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.02em",
          }}
        >
          Mais Vendidos
        </h2>
        <div className="w-8 h-px mx-auto mt-5" style={{ backgroundColor: C.bege2 }} />
      </div>

      {/* ── Carousel: [seta] [trilho] [seta]. As setas ficam em colunas
             próprias e nunca cobrem um card; no celular somem e vale arrastar. */}
      <div className="flex items-stretch gap-2 sm:gap-3 xl:gap-4">
        {seta(-1, canScrollLeft)}

        {/* Card widths:
            - celular:  w-4/5  (1,25 card visível, arrastando)
            - sm+:      w-1/3  (3 cards)
            - lg+:      w-1/4  (4 cards)
        */}
        <div
          ref={trackRef}
          onScroll={updateScrollState}
          className="flex min-w-0 flex-1 overflow-x-auto scroll-smooth pt-3 pb-6 -my-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product) => {
            const faixa = faixaDePreco(product);
            return (
              <div
                key={product.id}
                data-card
                className="flex-none w-4/5 sm:w-1/3 lg:w-1/4 px-2 2xl:px-2.5"
                style={{ scrollSnapAlign: "start" }}
              >
                <ProductCard
                  image={product.imagem_url || ""}
                  name={product.nome}
                  brand={product.marca}
                  category={product.categoria ? CATEGORY_LABELS[product.categoria] : ""}
                  price={faixa.min}
                  priceFrom={faixa.min !== faixa.max}
                  isFeatured={product.promocao}
                  onClick={() => setAberto(product)}
                />
              </div>
            );
          })}
        </div>

        {seta(1, canScrollRight)}
      </div>

      {aberto && <ProductModal key={aberto.id} product={aberto} onClose={() => setAberto(null)} />}
    </section>
  );
}
