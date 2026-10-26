import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { listProducts } from "@/features/catalog/catalogApi";
import type { Product } from "@/features/catalog/catalogTypes";
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from "@/features/catalog/catalogTypes";
import type { ProductCategory } from "@/features/catalog/catalogTypes";
import { X, ChevronLeft, Search, SlidersHorizontal } from "lucide-react";
import RangeSlider from "@/components/RangeSlider";
import CategoryDropdown from "@/components/CategoryDropdown";
import SiteNav from "@/components/SiteNav";
import ProductModal from "@/features/catalog/components/ProductModal";
import { faixaDePreco, formatarPreco, variacoesVisiveis } from "@/features/catalog/variantUtils";

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
  muted:   "#8A8270",
} as const;

export default function Catalog() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const produtoIdParam = params.get("produto");
  const variacaoParam = params.get("variacao");
  const categoriaParam = params.get("categoria") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filterCategoria, setFilterCategoria] = useState<string>("");
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterPrecoMin, setFilterPrecoMin] = useState("");
  const [filterPrecoMax, setFilterPrecoMax] = useState("");

  const [selected, setSelected] = useState<Product | null>(null);

  // A barra do topo leva a /catalogo?categoria=...; o filtro acompanha a URL.
  useEffect(() => {
    const valida = (PRODUCT_CATEGORIES as readonly string[]).includes(categoriaParam);
    setFilterCategoria(valida ? (categoriaParam as ProductCategory) : "");
  }, [categoriaParam]);

  useEffect(() => {
    async function load() {
      setIsLoading(true); setError("");
      try {
        const result = await listProducts({ ativo: true });
        setProducts(result.data);
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
        setError("Não foi possível carregar os produtos.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!produtoIdParam || products.length === 0) return;
    const produto = products.find((p) => String(p.id) === produtoIdParam || p.slug === produtoIdParam);
    if (produto) setSelected(produto);
  }, [produtoIdParam, products]);

  function applyFilters(items: Product[]) {
    return items.filter((p) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        const alvo = [p.nome, p.marca, p.colecao, ...variacoesVisiveis(p).map((v) => v.nome)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(s)) return false;
      }
      if (filterCategoria && p.categoria !== filterCategoria) return false;
      if (filterPromo && !p.promocao) return false;
      const faixa = faixaDePreco(p);
      if (filterPrecoMin && faixa.max < parseFloat(filterPrecoMin)) return false;
      if (filterPrecoMax && faixa.min > parseFloat(filterPrecoMax)) return false;
      return true;
    });
  }

  const filtered = applyFilters(products);

  // Teto do filtro de preço acompanha o produto mais caro.
  const precoTeto = Math.max(1000, Math.ceil(Math.max(0, ...products.map((p) => faixaDePreco(p).max)) / 100) * 100);

  function setQuery(next: Record<string, string | null>) {
    const q = new URLSearchParams(searchString);
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v); else q.delete(k);
    }
    const qs = q.toString();
    setLocation(qs ? `/catalogo?${qs}` : "/catalogo", { replace: true });
  }

  function openModal(product: Product) {
    setSelected(product);
    setQuery({ produto: product.slug ?? product.id, variacao: null });
  }
  function closeModal() {
    setSelected(null);
    setQuery({ produto: null, variacao: null });
  }

  // Lock scroll quando modal ou filtros estiverem abertos
  useEffect(() => {
    if (selected || showFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selected, showFilters]);

  function clearFilters() {
    if (categoriaParam) setQuery({ categoria: null });
    setFilterCategoria(""); setFilterPromo(false);
    setFilterPrecoMin(""); setFilterPrecoMax(""); setSearch("");
  }

  const hasActiveFilters = !!filterCategoria || filterPromo || !!filterPrecoMin || !!filterPrecoMax || !!search.trim();

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.owhite, fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      <SiteNav />

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header
        className="top-0 z-30"
        style={{
          backgroundColor: "rgba(250,245,237,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.bege2}`,
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-[10px] font-light tracking-[0.3em] uppercase transition hover:opacity-50"
            style={{ color: C.bege3, background: "none", border: "none", cursor: "pointer" }}
          >
            <ChevronLeft className="h-3 w-3" /> Início
          </button>

          <div className="flex flex-col items-center">
            <div className="h-12 w-12 md:h-20 md:w-20 shrink-0">
                <img
                  src="/logo2.png"
                  alt="Coral Acessórios Logo"
                  className="h-full w-full object-contain"
                />
              </div>
          </div>

          <div className="w-[72px]" />
        </div>
      </header>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 py-10 mx-auto w-full max-w-6xl">

        {/* Título da seção */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.4em] uppercase font-light mb-1" style={{ color: C.red1 }}>
            Coleção
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: C.noir, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}
          >
            {filterCategoria ? CATEGORY_LABELS[filterCategoria as ProductCategory] : "Todos os acessórios"}
          </h1>
        </div>

        {/* Busca + Filtros */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2 sm:gap-3 items-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: C.bege3 }} />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar peça..."
                className="w-full h-[38px] pl-8 pr-3 text-xs font-light outline-none transition rounded-sm"
                style={{ border: `1px solid ${C.bege2}`, background: C.white, color: C.noir }}
                onFocus={(e) => (e.target.style.borderColor = C.red1)}
                onBlur={(e) => (e.target.style.borderColor = C.bege2)}
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="flex h-[38px] items-center justify-center gap-2 px-4 text-[10px] font-light tracking-[0.25em] uppercase transition hover:opacity-70 rounded-sm whitespace-nowrap"
              style={{
                color: hasActiveFilters ? C.red1 : C.bege3,
                backgroundColor: hasActiveFilters ? C.pink1 : C.white,
                border: `1px solid ${hasActiveFilters ? C.pink2 : C.bege2}`,
                cursor: "pointer",
              }}
            >
              <SlidersHorizontal className="h-3 w-3" />
              {hasActiveFilters ? "Filtros ativos" : "Filtros"}
            </button>
          </div>
        </div>

        {/* ── FILTROS MODAL (CENTRALIZADO VERTICALMENTE) ──── */}
        {showFilters && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowFilters(false)}
          >
            <div
              className="rounded-[40px] overflow-hidden flex flex-col bg-white/90 backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(90vw, 400px)",
                maxHeight: "85vh",
                boxShadow: "0 30px 80px rgba(51,51,51,0.25)",
              }}
            >
              {/* Header - Fixo no topo */}
              <div className="flex-shrink-0 px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: C.bege1 }}>
                <span className="text-[9px] tracking-[0.35em] uppercase font-medium" style={{ color: C.noir }}>
                  Filtros
                </span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex h-8 w-8 items-center justify-center transition hover:opacity-70 rounded-full"
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.noir }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content - Scrollável se necessário, mas dimensionado para caber */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Categoria */}
                <div>
                  <label className="block text-[9px] tracking-[0.3em] uppercase font-light mb-2" style={{ color: C.bege3 }}>
                    Categoria
                  </label>
                  <CategoryDropdown
                    value={filterCategoria}
                    onChange={(v) => {
                      setFilterCategoria(v);
                      setQuery({ categoria: v || null });
                    }}
                    options={[
                      { value: "", label: "Todas as categorias" },
                      ...PRODUCT_CATEGORIES.map((c) => ({
                        value: c,
                        label: CATEGORY_LABELS[c],
                      })),
                    ]}
                  />
                </div>

                {/* Range Slider */}
                <div>
                  <label className="block text-[9px] tracking-[0.3em] uppercase font-light mb-3" style={{ color: C.bege3 }}>
                    Preço
                  </label>
                  <RangeSlider
                    min={0}
                    max={precoTeto}
                    step={10}
                    valueMin={parseFloat(filterPrecoMin) || 0}
                    valueMax={parseFloat(filterPrecoMax) || precoTeto}
                    onChangeMin={(val) => setFilterPrecoMin(val.toString())}
                    onChangeMax={(val) => setFilterPrecoMax(val.toString())}
                  />
                </div>
              </div>

              {/* Footer - Botão "Limpar" Fixo */}
              <div className="flex-shrink-0 border-t px-6 py-3.5" style={{ borderColor: C.bege1 }}>
                <button
                  onClick={() => {
                    if (hasActiveFilters) {
                      clearFilters();
                    }
                    setShowFilters(false);
                  }}
                  className="w-full text-[10px] tracking-[0.3em] uppercase font-light transition py-2.5 rounded-lg"
                  style={{
                    color: hasActiveFilters ? C.red1 : C.bege3,
                    background: hasActiveFilters ? C.pink1 : "transparent",
                    border: `1px solid ${hasActiveFilters ? C.pink2 : C.bege2}`,
                    cursor: "pointer",
                  }}
                >
                  {hasActiveFilters ? "Limpar Filtros" : "Fechar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: C.bege2, borderTopColor: C.red1 }} />
            <p className="text-[10px] tracking-[0.35em] uppercase font-light" style={{ color: C.bege3 }}>
              Carregando coleção...
            </p>
          </div>
        ) : error ? (
          <div className="py-32 text-center">
            <p className="text-xs font-light" style={{ color: C.bege3 }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-px" style={{ backgroundColor: C.bege2 }} />
            <p className="text-xs font-light" style={{ color: C.bege3 }}>
              {hasActiveFilters ? "Nenhuma peça encontrada para esses filtros." : "Nenhuma peça disponível no momento."}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="text-[9px] tracking-[0.35em] uppercase font-light transition hover:opacity-50"
                style={{ color: C.red1, background: "none", border: "none", cursor: "pointer" }}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => {
              const opcoes = variacoesVisiveis(product).length;
              const faixa = faixaDePreco(product);
              return (
              <div
                key={product.id}
                data-testid="product-card"
                onClick={() => openModal(product)}
                className="group relative flex flex-col cursor-pointer rounded-xl overflow-hidden transition hover:shadow-md"
                style={{
                  background: C.white,
                  border: `1px solid ${C.bege1}`,
                  boxShadow: "0 2px 8px rgba(51,51,51,0.04)",
                }}
              >
                {product.promocao && (
                  <div className="absolute top-2.5 left-2.5 z-10 text-[9px] font-medium tracking-wider uppercase rounded-full px-2 py-0.5"
                    style={{ color: C.white, background: C.red1 }}>
                    Destaque
                  </div>
                )}

                <div className="overflow-hidden" style={{ aspectRatio: "3/4", backgroundColor: C.bege1 }}>
                  {product.imagem_url ? (
                    <img
                      src={product.imagem_url} alt={product.nome} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[10px] font-light tracking-widest uppercase" style={{ color: C.bege3 }}>Peça</span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col flex-1">
                  {product.marca && (
                    <p data-testid="card-brand" className="text-[8.5px] tracking-[0.25em] uppercase font-light mb-1 truncate" style={{ color: C.muted }}>
                      {product.marca}
                    </p>
                  )}
                  <p className="text-xs font-medium leading-snug mb-1.5 line-clamp-2" style={{ color: C.noir }}>
                    {product.nome}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <p className="text-xs font-medium" style={{ color: product.promocao ? C.red1 : C.noir }}>
                      {faixa.min !== faixa.max && (
                        <span className="block text-[9px] font-light" style={{ color: C.muted }}>a partir de</span>
                      )}
                      {formatarPreco(faixa.min)}
                    </p>
                    {opcoes > 1 && (
                      <span data-testid="card-options" className="shrink-0 text-[9px] font-light tracking-[0.04em]" style={{ color: C.muted }}>
                        {opcoes} opções
                      </span>
                    )}
                  </div>
                </div>

                {/* underline hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ backgroundColor: C.red1 }} />
              </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-right text-[10px] font-light mt-6" style={{ color: C.bege3 }}>
            {filtered.length} peça{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="flex flex-col items-center p-8 text-center border-t" style={{ borderColor: C.bege2, background: C.white }}>
        <div className="h-8 w-8 md:h-12 md:w-12 shrink-0 mb-2">
          <img
            src="/logo.png"
            alt="Coral Acessórios Logo"
            className="h-full w-full object-contain"
            />
        </div>
        <p className="text-[9px] tracking-[0.4em] uppercase font-light" style={{ color: C.bege3 }}>
          © 2026 Coral Acessórios
        </p>
      </footer>

      {selected && (
        <ProductModal
          key={selected.id}
          product={selected}
          initialVariationId={variacaoParam}
          onClose={closeModal}
          onVariationChange={(id) => setQuery({ variacao: id })}
        />
      )}
    </div>
  );
}
