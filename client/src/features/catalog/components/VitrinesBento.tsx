import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/features/catalog/catalogTypes";
import { carregarCatalogoPublico } from "@/features/catalog/catalogApi";
import { faixaDePreco, formatarPreco, variacoesVisiveis } from "@/features/catalog/variantUtils";
import { ordemNaGrade, selecionarVitrine } from "@/features/catalog/vitrine";
import ProductModal from "@/features/catalog/components/ProductModal";
import { ITENS_POR_VITRINE, VITRINES, type Vitrine } from "@/config/vitrines";
import { C, FONT_SERIF } from "@/lib/coralTheme";
import { FOCO_CARD, SOMBRA_HOVER } from "@/lib/cardClicavel";
import { propsFoto } from "@/lib/imagem";

// Fundo neutro dos blocos. As fotos usam mix-blend multiply: o branco das
// fotos do fornecedor vira este tom, e o bloco não fica com um quadrado branco.
const FUNDO_FOTO = "#F3EEE7";
const SOMBRA_BASE = "0 4px 16px rgba(253, 110, 94, 0.08)";
const SOMBRA_ALTA = "0 20px 40px rgba(253, 110, 94, 0.15)";

/*
 * Composição do bento (7 produtos):
 *   desktop (lg, 4 colunas, 3 linhas)
 *     [ 0 grande 2x2 ][ 1 alto ][ 2 ]
 *     [              ][        ][ 3 ]
 *     [ 4 largo 2x1  ][ 5     ][ 6 ]
 *   tablet (sm, 2 colunas): o 0 ocupa a largura (2x2), os outros 6 em pares.
 *   celular (2 colunas): o 0 ocupa a largura, depois 4 pequenos; o 6º e o 7º
 *   ficam escondidos para a página não crescer.
 */
const POSICAO: string[] = [
  "col-span-2 row-span-2",
  "lg:row-span-2",
  "",
  "",
  "lg:col-span-2",
  "hidden sm:block",
  "hidden sm:block",
];

function Bloco({
  product,
  indice,
  onOpen,
}: {
  product: Product;
  indice: number;
  onOpen: (p: Product) => void;
}) {
  const reduzir = useReducedMotion();
  const grande = indice === 0;
  const opcoes = variacoesVisiveis(product).length;
  const faixa = faixaDePreco(product);

  return (
    <motion.button
      type="button"
      data-testid="bento-item"
      onClick={() => onOpen(product)}
      aria-label={`Ver ${product.nome}`}
      className={`group relative h-full w-full rounded-[22px] text-left sm:rounded-[28px] ${FOCO_CARD} ${POSICAO[indice] ?? ""}`}
      style={{ boxShadow: SOMBRA_BASE, cursor: "pointer" }}
      initial={reduzir ? false : { opacity: 0, y: 24 }}
      whileInView={reduzir ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: reduzir ? 0 : indice * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduzir ? undefined : { y: -6 }}
    >
      {/* Sombra do hover numa camada própria: só a opacidade anima (barato),
          em vez de redesenhar o box-shadow a cada quadro. Fica fora do
          recorte abaixo, então continua aparecendo. */}
      <span aria-hidden="true" className={SOMBRA_HOVER} style={{ boxShadow: SOMBRA_ALTA }} />

      {/* Recorte arredondado. O clip-path e o isolation fazem o Safari
          recortar também a foto em escala (camada própria durante o hover) e
          manter o multiply dentro do card; sem isso, o canto reto e branco da
          foto vazava por trás do arredondamento. Raio igual ao do botão. */}
      <span
        className="absolute inset-0 block overflow-hidden rounded-[inherit] [clip-path:inset(0_round_22px)] sm:[clip-path:inset(0_round_28px)]"
        style={{ isolation: "isolate", background: FUNDO_FOTO, border: `1px solid ${C.bege1}` }}
      >
      {product.imagem_url ? (
        <img
          {...propsFoto(product.imagem_url, grande || indice === 4 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw")}
          alt={product.nome}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-[inherit] object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
          style={{ mixBlendMode: "multiply" }}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest" style={{ color: C.bege3 }}>
          Peça
        </span>
      )}

      {product.promocao && (
        <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider"
          style={{ background: C.red1, color: C.white }}>
          Destaque
        </span>
      )}

      {/* etiqueta com as informações */}
      <span
        className={`absolute bottom-2.5 left-2.5 right-2.5 block rounded-2xl sm:bottom-3 sm:left-3 sm:right-3 ${grande ? "px-4 py-3 sm:px-5 sm:py-4" : "px-3 py-2"}`}
        // Sem backdrop-filter: com 14 etiquetas na página, o desfoque pesava na
        // rolagem do Safari. Branco um pouco mais opaco no lugar.
        style={{ background: "rgba(255,255,255,0.9)" }}
      >
        {product.marca && (
          <span className="block truncate text-[8.5px] font-light uppercase tracking-[0.22em] sm:text-[9px]" style={{ color: C.muted }}>
            {product.marca}
          </span>
        )}
        <span
          className={`block truncate font-bold leading-snug ${grande ? "text-base sm:text-xl xl:text-2xl" : "text-[12.5px] sm:text-sm xl:text-[15px]"}`}
          style={{ color: C.noir, fontFamily: grande ? FONT_SERIF : undefined }}
        >
          {product.nome}
        </span>
        <span className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className={`font-semibold tabular-nums ${grande ? "text-sm sm:text-base" : "text-[11.5px] sm:text-[13px]"}`} style={{ color: C.red1 }}>
            {faixa.min !== faixa.max && (
              <span className="mr-1 text-[9px] font-light sm:text-[10px]" style={{ color: C.muted }}>a partir de</span>
            )}
            {formatarPreco(faixa.min)}
          </span>
          {opcoes > 1 && (
            <span data-testid="bento-options" className="shrink-0 text-[9px] font-light sm:text-[10px]" style={{ color: C.muted }}>
              {opcoes} opções
            </span>
          )}
        </span>
      </span>
      </span>
    </motion.button>
  );
}

function Secao({ vitrine, produtos, onOpen }: { vitrine: Vitrine; produtos: Product[]; onOpen: (p: Product) => void }) {
  // Do mais caro para o mais barato; o mais caro no bloco grande, os 2
  // seguintes nos médios, o resto nos pequenos.
  const itens = ordemNaGrade(selecionarVitrine(produtos, vitrine.categoria, vitrine.slugs, ITENS_POR_VITRINE));
  if (itens.length === 0) return null;

  return (
    <section
      data-testid={`vitrine-${vitrine.categoria}`}
      // Mesma largura do carrossel "Mais Vendidos": cresce em telas grandes.
      className="relative left-1/2 w-full -translate-x-1/2 lg:w-[min(calc(100vw-48px),1240px)] 2xl:w-[min(calc(100vw-64px),1440px)]"
    >
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-[9px] font-light uppercase tracking-[0.5em]" style={{ color: C.red1 }}>
          {vitrine.rotulo}
        </p>
        <h2 className="text-2xl font-bold leading-tight sm:text-4xl" style={{ color: C.noir, fontFamily: FONT_SERIF, letterSpacing: "-0.02em" }}>
          {vitrine.titulo}
        </h2>
        <div className="mx-auto mt-5 h-px w-8" style={{ backgroundColor: C.bege2 }} />
      </div>

      <div
        className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4 [grid-auto-rows:clamp(150px,42vw,200px)] sm:[grid-auto-rows:clamp(200px,30vw,280px)] lg:[grid-auto-rows:clamp(200px,16vw,300px)]"
      >
        {itens.slice(0, ITENS_POR_VITRINE).map((p, i) => (
          <Bloco key={p.id} product={p} indice={i} onOpen={onOpen} />
        ))}
      </div>

      <div className="mt-7 flex justify-center sm:mt-8">
        <Link
          href={`/catalogo?categoria=${vitrine.categoria}`}
          className="group inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] transition hover:opacity-70"
          style={{ color: C.red2 }}
        >
          {vitrine.linkTexto}
          <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

export default function VitrinesBento() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [aberto, setAberto] = useState<Product | null>(null);

  useEffect(() => {
    let ativo = true;
    carregarCatalogoPublico()
      .then((r) => { if (ativo) setProdutos(r.data); })
      .catch(() => { if (ativo) setProdutos([]); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [aberto]);

  if (produtos.length === 0) return null;

  return (
    <>
      {VITRINES.map((v) => (
        <Secao key={v.categoria} vitrine={v} produtos={produtos} onOpen={setAberto} />
      ))}
      {aberto && <ProductModal key={aberto.id} product={aberto} onClose={() => setAberto(null)} />}
    </>
  );
}
