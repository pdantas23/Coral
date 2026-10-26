import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { listProducts } from "@/features/catalog/catalogApi";
import type { Product } from "@/features/catalog/catalogTypes";
import { ExternalLink, Copy, CheckCheck, TrendingUp, Package, Tag } from "lucide-react";

// ─── Paleta Coral ─────────────────────────────────────────────────────────────
const C = {
  red1:    "#FD6E5E",
  red2:    "#CC4834",
  pink1:   "#FEEDED",
  noir:    "#333333",
  bege1:   "#EDE8E1",
  bege2:   "#DED6BF",
  bege3:   "#C8C1AC",
  owhite:  "#FAF5ED",
  white:   "#FFFFFF",
} as const;

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

const NAV = [{ label: "Marketing", href: "/marketing" }];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildProductLink(productId: string): string {
  return `${window.location.origin}/catalogo?produto=${productId}`;
}

function buildWhatsAppBlast(products: Product[]): string {
  const number = (WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const destaques = products.filter((p) => p.promocao);
  let text = "✨ *Coral Acessórios — Novidades da coleção*\n\n";
  if (destaques.length > 0) {
    text += "🌸 *Produtos em destaque:*\n";
    for (const p of destaques.slice(0, 5)) {
      text += `• ${p.nome} — R$ ${p.preco.toFixed(2).replace(".", ",")}\n`;
    }
    text += "\n";
  }
  text += "Ver coleção completa:\n";
  text += `${window.location.origin}/catalogo`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-6 rounded-xl"
      style={{ backgroundColor: C.white, border: `1px solid ${C.bege2}` }}
    >
      <p className="text-[9px] font-light tracking-[0.45em] uppercase" style={{ color: C.bege3 }}>{label}</p>
      <p
        className="text-3xl font-bold"
        style={{ color: C.noir, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] font-light" style={{ color: C.bege3 }}>{sub}</p>}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copiar link" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <button
      type="button" onClick={handleCopy}
      className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.25em] uppercase transition hover:opacity-60"
      style={{ color: copied ? C.red1 : C.bege3, background: "none", border: "none", cursor: "pointer" }}
    >
      {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado!" : label}
    </button>
  );
}

// ─── Marketing ────────────────────────────────────────────────────────────────

export default function Marketing() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    listProducts({ ativo: true })
      .then((res) => setProducts(res.data))
      .catch(() => setError("Não foi possível carregar os produtos."))
      .finally(() => setIsLoading(false));
  }, []);

  const total       = products.length;
  const destaques   = products.filter((p) => p.promocao).length;
  const catalogUrl  = `${typeof window !== "undefined" ? window.location.origin : ""}/catalogo`;
  const whatsappUrl = products.length > 0 ? buildWhatsAppBlast(products) : "#";

  return (
    <DashboardLayout navItems={NAV}>
      <div className="space-y-8">

        {/* Cabeçalho */}
        <div>
          <p className="text-[9px] font-light tracking-[0.45em] uppercase mb-1" style={{ color: C.bege3 }}>Área</p>
          <h1
            className="text-2xl font-bold"
            style={{ color: C.noir, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Marketing
          </h1>
          <p className="text-xs font-light mt-0.5" style={{ color: C.bege3 }}>
            Visão geral da coleção e ferramentas de divulgação
          </p>
        </div>

        {/* Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total de produtos" value={total} sub="publicados no catálogo" />
            <StatCard label="Destaques" value={destaques} sub="marcados como promoção" />
            <StatCard label="Catálogo" value="Público" sub="acessível sem login" />
          </div>
        )}

        {/* Ferramentas de divulgação */}
        <section>
          <p className="text-[9px] tracking-[0.45em] uppercase font-light mb-4" style={{ color: C.bege3 }}>
            Divulgação
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Link do catálogo */}
            <div
              className="p-6 flex flex-col gap-3 rounded-xl"
              style={{ backgroundColor: C.white, border: `1px solid ${C.bege2}` }}
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5" style={{ color: C.red1 }} />
                <p className="text-[9px] tracking-[0.4em] uppercase font-medium" style={{ color: C.noir }}>
                  Link do catálogo
                </p>
              </div>
              <p className="text-sm font-light break-all" style={{ color: C.bege3 }}>{catalogUrl}</p>
              <p className="text-xs font-light" style={{ color: C.bege3 }}>
                Compartilhe este link para que clientes acessem a coleção completa.
              </p>
              <div className="flex items-center gap-4 mt-1">
                <CopyButton text={catalogUrl} />
                <a
                  href={catalogUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-light tracking-[0.3em] uppercase transition hover:opacity-60"
                  style={{ color: C.bege3, textDecoration: "none" }}
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir
                </a>
              </div>
            </div>

            {/* Mensagem WhatsApp */}
            <div
              className="p-6 flex flex-col gap-3 rounded-xl"
              style={{ backgroundColor: C.white, border: `1px solid ${C.bege2}` }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: C.red1 }} />
                <p className="text-[9px] tracking-[0.4em] uppercase font-medium" style={{ color: C.noir }}>
                  Disparo WhatsApp
                </p>
              </div>
              <p className="text-sm font-medium" style={{ color: C.noir }}>
                Mensagem pré-formatada com destaques
              </p>
              <p className="text-xs font-light" style={{ color: C.bege3 }}>
                Abre o WhatsApp com uma mensagem pronta para envio com as peças em destaque.
              </p>
              <a
                href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1 self-start flex items-center gap-1.5 text-[11px] font-medium tracking-[0.25em] uppercase transition hover:opacity-85 rounded-full px-5 py-2.5"
                style={{
                  color: C.white,
                  background: `linear-gradient(135deg, ${C.red1} 0%, ${C.red2} 100%)`,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(253,110,94,0.25)",
                }}
              >
                Abrir no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Produtos destaques */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] tracking-[0.45em] uppercase font-light" style={{ color: C.bege3 }}>
              Produtos em destaque
            </p>
            <span className="text-[9px] font-light" style={{ color: C.bege3 }}>
              {destaques} produto{destaques !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: C.bege2, borderTopColor: C.red1 }} />
              <p className="text-[10px] font-light tracking-widest uppercase" style={{ color: C.bege3 }}>Carregando...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-xs font-light" style={{ color: C.bege3 }}>{error}</p>
            </div>
          ) : products.filter(p => p.promocao).length === 0 ? (
            <div
              className="py-12 text-center rounded-xl"
              style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.white }}
            >
              <Tag className="h-6 w-6 mx-auto mb-3" style={{ color: C.bege3 }} />
              <p className="text-xs font-light" style={{ color: C.bege3 }}>
                Nenhum produto marcado como destaque.
              </p>
              <p className="text-[10px] font-light mt-1" style={{ color: C.bege3 }}>
                Acesse a área Comercial para marcar produtos como destaque.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.white }}
            >
              {products.filter(p => p.promocao).map((product, idx) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderTop: idx === 0 ? "none" : `1px solid ${C.bege1}` }}
                >
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md"
                    style={{ backgroundColor: C.bege1 }}
                  >
                    {product.imagem_url
                      ? <img src={product.imagem_url} alt={product.nome} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4" style={{ color: C.bege3 }} />
                        </div>
                    }
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: C.noir }}>{product.nome}</p>
                    <p className="text-xs font-light" style={{ color: C.red1 }}>
                      R$ {product.preco.toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <CopyButton text={buildProductLink(product.id)} label="Copiar link" />
                    <a
                      href={buildProductLink(product.id)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 transition hover:opacity-50"
                      style={{ color: C.bege3, textDecoration: "none" }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Todos os produtos */}
        {!isLoading && !error && products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] tracking-[0.45em] uppercase font-light" style={{ color: C.bege3 }}>
                Todos os produtos
              </p>
              <span className="text-[9px] font-light" style={{ color: C.bege3 }}>{total} no catálogo</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col rounded-xl overflow-hidden"
                  style={{ backgroundColor: C.white, border: `1px solid ${C.bege2}` }}
                >
                  <div className="overflow-hidden relative" style={{ aspectRatio: "1/1", backgroundColor: C.bege1 }}>
                    {product.imagem_url
                      ? <img
                          src={product.imagem_url} alt={product.nome}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6" style={{ color: C.bege3 }} />
                        </div>
                    }
                    {product.promocao && (
                      <div
                        className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[8px] font-medium tracking-wider uppercase rounded-full"
                        style={{ backgroundColor: C.red1, color: C.white }}
                      >
                        Destaque
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="text-xs font-medium line-clamp-2 leading-snug" style={{ color: C.noir }}>{product.nome}</p>
                    <p className="text-xs font-light" style={{ color: product.promocao ? C.red1 : C.bege3 }}>
                      R$ {product.preco.toFixed(2).replace(".", ",")}
                    </p>
                    <div className="pt-1">
                      <CopyButton text={buildProductLink(product.id)} label="Copiar link" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
