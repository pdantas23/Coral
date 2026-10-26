import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, MessageCircle, Minus, Plus, Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/features/catalog/catalogTypes";
import { CATEGORY_LABELS } from "@/features/catalog/catalogTypes";
import {
  codigoEfetivo,
  descricaoEfetiva,
  formatarPreco,
  galeria,
  nomeComVariacao,
  precoEfetivo,
  variacoesVisiveis,
} from "@/features/catalog/variantUtils";
import { useCart } from "@/features/cart/CartContext";
import { linkWhatsApp } from "@/lib/whatsapp";
import { C, FONT_SERIF } from "@/lib/coralTheme";

type Props = {
  product: Product;
  initialVariationId?: string | null;
  onClose: () => void;
  onVariationChange?: (variacaoId: string | null) => void;
};

/** Mensagem do botão de peça única (mesmo padrão de antes, agora com a variação). */
export function mensagemPecaUnica(nome: string, imageUrl: string | null): string {
  let message = `Olá! Tenho interesse na peça *${nome}*. Pode me passar mais informações?`;
  if (imageUrl) message += `\n\n${imageUrl}`;
  return message;
}

export default function ProductModal({ product, initialVariationId, onClose, onVariationChange }: Props) {
  const variacoes = useMemo(() => variacoesVisiveis(product), [product]);
  const [variacaoId, setVariacaoId] = useState<string | null>(
    () => variacoes.find((v) => v.id === initialVariationId)?.id ?? variacoes[0]?.id ?? null
  );
  const variacao = variacoes.find((v) => v.id === variacaoId) ?? null;

  const imagens = useMemo(() => galeria(product, variacao), [product, variacao]);
  const [idx, setIdx] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionar, abrir } = useCart();

  const preco = precoEfetivo(product, variacao);
  const codigo = codigoEfetivo(product, variacao);
  const descricao = descricaoEfetiva(product, variacao);
  const nomeItem = nomeComVariacao(product.nome, variacao?.nome);

  useEffect(() => { setIdx(0); }, [variacaoId]);
  useEffect(() => { setAdicionado(false); }, [variacaoId, quantidade]);

  function escolher(id: string) {
    setVariacaoId(id);
    onVariationChange?.(id);
  }

  function prev() { setIdx((i) => (i === 0 ? imagens.length - 1 : i - 1)); }
  function next() { setIdx((i) => (i === imagens.length - 1 ? 0 : i + 1)); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && imagens.length > 1) prev();
      if (e.key === "ArrowRight" && imagens.length > 1) next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function adicionarNaSacola() {
    adicionar(
      {
        produtoId: product.id,
        variacaoId: variacao?.id ?? null,
        nome: product.nome,
        marca: product.marca ?? null,
        variacaoNome: variacao?.nome ?? null,
        codigo,
        precoUnitario: preco,
        imagem: imagens[0] ?? null,
      },
      quantidade
    );
    setAdicionado(true);
  }

  const whatsapp = linkWhatsApp(mensagemPecaUnica(nomeItem, imagens[0] ?? null));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: "rgba(51,51,51,0.60)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.nome}
        data-testid="product-modal"
        className="relative flex w-full flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px] md:flex-row"
        style={{
          maxWidth: "min(100vw, 920px)",
          height: "min(92dvh, 640px)",
          boxShadow: "0 30px 80px rgba(51,51,51,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-70"
          style={{ color: C.noir, background: "rgba(237,232,225,0.92)", border: "none", cursor: "pointer" }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Galeria ───────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col md:w-[52%] md:shrink">
          <div className="group relative h-[32dvh] min-h-[200px] overflow-hidden sm:h-[44dvh] md:h-auto md:flex-1" style={{ background: C.bege1 }}>
            {imagens.length > 0 ? (
              <img
                key={imagens[idx]}
                src={imagens[idx]}
                alt={nomeItem}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-[10px] font-light uppercase tracking-widest" style={{ color: C.bege3 }}>Peça</span>
              </div>
            )}

            {product.promocao && (
              <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: C.white, background: C.red1 }}>
                Destaque
              </div>
            )}

            {imagens.length > 1 && (
              <>
                <button onClick={prev} aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:opacity-0 md:group-hover:opacity-100"
                  style={{ background: "rgba(255,255,255,0.92)", color: C.noir, border: "none", cursor: "pointer" }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:opacity-0 md:group-hover:opacity-100"
                  style={{ background: "rgba(255,255,255,0.92)", color: C.noir, border: "none", cursor: "pointer" }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-light"
                  style={{ color: C.white, background: "rgba(51,51,51,0.45)" }}>
                  {idx + 1} / {imagens.length}
                </div>
              </>
            )}
          </div>

          {imagens.length > 1 && (
            <div className="hidden shrink-0 gap-2 overflow-x-auto px-3 pb-2 pt-2.5 md:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {imagens.map((url, i) => (
                <button key={url} onClick={() => setIdx(i)} aria-label={`Foto ${i + 1}`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-md transition"
                  style={{ border: `2px solid ${i === idx ? C.red1 : "transparent"}`, cursor: "pointer", background: "none" }}>
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Informações ───────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col md:w-[48%]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-4 md:px-7 md:pt-7">
            <p className="mb-1.5 pr-10 text-[9px] font-light uppercase tracking-[0.3em]" style={{ color: C.muted }}>
              {[product.marca, product.colecao ? `Coleção ${product.colecao}` : null, product.categoria ? CATEGORY_LABELS[product.categoria] : null]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
            <h2 data-testid="product-name" className="pr-8 text-xl font-bold leading-tight md:text-2xl" style={{ color: C.noir, fontFamily: FONT_SERIF }}>
              {nomeItem}
            </h2>

            <div className="mt-2 flex items-baseline gap-3">
              <span data-testid="product-price" className="text-xl font-bold tabular-nums" style={{ color: C.noir, fontFamily: FONT_SERIF }}>
                {formatarPreco(preco)}
              </span>
              {codigo && (
                <span data-testid="product-code" className="text-[10px] font-light tracking-[0.08em]" style={{ color: C.muted }}>
                  Cód. {codigo}
                </span>
              )}
            </div>

            {variacoes.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 text-[9px] font-light uppercase tracking-[0.3em]" style={{ color: C.muted }}>
                  Opções <span style={{ color: C.noir }}>({variacoes.length})</span>
                </p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Escolha a opção">
                  {variacoes.map((v) => {
                    const sel = v.id === variacaoId;
                    const precoV = precoEfetivo(product, v);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        data-testid="variation-option"
                        onClick={() => escolher(v.id)}
                        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-left text-[11px] leading-tight transition"
                        style={{
                          border: `1px solid ${sel ? C.red1 : C.bege2}`,
                          background: sel ? C.pink1 : C.white,
                          color: C.noir,
                          cursor: "pointer",
                        }}
                      >
                        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full" style={{ background: C.bege1 }}>
                          {v.imagens[0] && <img src={v.imagens[0].url} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span>
                          {v.nome}
                          {precoV !== preco && (
                            <span className="ml-1 tabular-nums" style={{ color: C.muted }}>{formatarPreco(precoV)}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {descricao && (
              <p className="mt-5 whitespace-pre-line text-xs font-light leading-relaxed" style={{ color: "#5B564C" }}>
                {descricao}
              </p>
            )}
          </div>

          {/* ── Ações ── */}
          <div className="shrink-0 px-5 pb-4 pt-3 md:px-7 md:pb-6" style={{ borderTop: `1px solid ${C.bege1}` }}>
            <div className="flex items-stretch gap-2">
              <div className="flex items-center rounded-lg" style={{ border: `1px solid ${C.bege2}` }}>
                <button type="button" aria-label="Diminuir quantidade" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  className="flex h-full w-9 items-center justify-center transition hover:opacity-60"
                  style={{ color: C.noir, background: "none", border: "none", cursor: "pointer" }}>
                  <Minus className="h-3 w-3" />
                </button>
                <span data-testid="product-qty" className="w-6 text-center text-sm tabular-nums" style={{ color: C.noir }}>{quantidade}</span>
                <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
                  className="flex h-full w-9 items-center justify-center transition hover:opacity-60"
                  style={{ color: C.noir, background: "none", border: "none", cursor: "pointer" }}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                data-testid="add-to-cart"
                onClick={adicionado ? abrir : adicionarNaSacola}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-medium uppercase tracking-[0.2em] transition hover:opacity-90"
                style={{ background: C.red1, color: C.white, border: "none", cursor: "pointer" }}
              >
                {adicionado ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                {adicionado ? "Adicionado. Ver sacola" : "Adicionar à sacola"}
              </button>
            </div>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-single"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] transition hover:opacity-80"
              style={{ background: C.pink1, color: C.red2, border: `1px solid ${C.pink2}55` }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Solicitar só esta peça pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
