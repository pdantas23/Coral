import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listProducts } from "@/features/catalog/catalogApi";
import { CATEGORY_LABELS, type Product } from "@/features/catalog/catalogTypes";
import ProductCard from "@/components/ProductCard";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [, setLocation] = useLocation();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listProducts({ ativo: true })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  // Reset scroll and refresh arrow states whenever products list changes
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    setCanScrollLeft(false);
    const t = setTimeout(updateScrollState, 60);
    return () => clearTimeout(t);
  }, [products.length, updateScrollState]);

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    if (!card) return;
    el.scrollBy({ left: card.offsetWidth * direction, behavior: "smooth" });
  }

  if (loading || products.length === 0) return null;

  return (
    <section className="w-full">
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

      {/* ── Carousel ───────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollByCards(-1)}
          disabled={!canScrollLeft}
          className="absolute left-0 top-[36%] -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: C.white,
            border: `1px solid ${C.bege2}`,
            color: C.noir,
            opacity: canScrollLeft ? 1 : 0,
            pointerEvents: canScrollLeft ? "auto" : "none",
            boxShadow: "0 8px 24px rgba(253, 110, 94, 0.15)"
          }}
          aria-label="Produto anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Scrollable track
            Card widths:
            - default (mobile): w-4/5  → 1.25 cards visible
            - sm (640px+):      w-1/3  → 3 cards visible
            - lg (1024px+):     w-1/4  → 4 cards visible
        */}
        <div
          ref={trackRef}
          onScroll={updateScrollState}
          className="flex overflow-x-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-card
              className="flex-none w-4/5 sm:w-1/3 lg:w-1/4 px-2"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard
                image={product.imagem_url || ""}
                name={product.nome}
                category={product.categoria ? CATEGORY_LABELS[product.categoria] : ""}
                price={product.preco}
                isFeatured={product.promocao}
                onClick={() => setLocation(`/catalogo?produto=${product.id}`)}
              />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollByCards(1)}
          disabled={!canScrollRight}
          className="absolute right-0 top-[36%] -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: C.white,
            border: `1px solid ${C.bege2}`,
            color: C.noir,
            opacity: canScrollRight ? 1 : 0,
            pointerEvents: canScrollRight ? "auto" : "none",
            boxShadow: "0 8px 24px rgba(253, 110, 94, 0.15)"
          }}
          aria-label="Próximo produto"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
