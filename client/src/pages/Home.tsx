import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { listProducts } from "@/features/catalog/catalogApi";
import type { Product } from "@/features/catalog/catalogTypes";
import ShaderBackground from "@/components/ui/shader-background";
import BestSellersCarousel from "@/features/catalog/components/BestSellersCarousel";
import {
  ArrowRight,
  Instagram,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react";

// SVG noise pattern (encoded inline)
const NOISE_PATTERN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E`;

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;
const MAPS_ADDRESS = encodeURIComponent("Av. Sen. Area Leão, 2185 - São Cristóvão, Teresina - PI, 64049-010");

// ─── Paleta Coral ─────────────────────────────────────────────────────────────
const C = {
  red1:    "#FD6E5E",   // coral principal
  red2:    "#CC4834",   // coral escuro
  pink1:   "#FEEDED",   // rosa claro (bg suave)
  pink2:   "#FFADA2",   // salmão (acento)
  noir:    "#333333",   // texto
  bege1:   "#EDE8E1",   // bege claro
  bege2:   "#DED6BF",   // bege médio / bordas
  bege3:   "#C8C1AC",   // bege muted / texto secundário
  owhite:  "#FAF5ED",   // off-white fundo
  white:   "#FFFFFF",
} as const;

// ─── Helpers de preload ───────────────────────────────────────────────────────
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src) { resolve(); return; }
    const img = new Image();
    img.src = src;
    if (img.complete) { resolve(); return; }
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

async function preloadImages(urls: string[]) {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  await Promise.all(uniqueUrls.map(preloadImage));
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [, setLocation] = useLocation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [homeReady, setHomeReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadHome() {
      try {
        const res = await listProducts({ ativo: true });
        const all = res.data;
        const nextFeatured = all.slice(0, 4);
        const imgs = nextFeatured.map((p) => p.imagem_url || "").filter(Boolean);
        await preloadImages(imgs);
        if (!active) return;
        setFeatured(nextFeatured);
        setHomeReady(true);
      } catch {
        if (!active) return;
        setFeatured([]);
        setHomeReady(true);
      }
    }
    loadHome();
    return () => { active = false; };
  }, []);

  function goWhatsApp() {
    const msg = encodeURIComponent("Olá! Gostaria de um atendimento personalizado.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  const showLoadingOverlay = !homeReady;

  return (
    <>
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ background: C.owhite }}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: C.bege2, borderTopColor: C.red1 }} />
            <p className="text-sm tracking-widest uppercase"
              style={{ color: C.bege3, fontFamily: "'DM Sans', sans-serif" }}>
              Carregando...
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col relative"
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
          background: `linear-gradient(135deg, ${C.owhite} 0%, ${C.bege1} 30%, ${C.pink1} 60%, ${C.pink2} 85%, ${C.owhite} 100%)`,
          backgroundAttachment: 'fixed',
          backgroundImage: `url("${NOISE_PATTERN}"), linear-gradient(135deg, ${C.owhite} 0%, ${C.bege1} 30%, ${C.pink1} 60%, ${C.pink2} 85%, ${C.owhite} 100%)`
        }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden w-full flex flex-col items-center py-10 sm:py-14 px-6"
          style={{ borderBottom: `1px solid ${C.bege2}` }}>

          <ShaderBackground />

          {/* Overlay for text readability */}
          <div className="absolute inset-0 z-0" style={{ background: "rgba(250,245,237,0.35)" }} />

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center w-full">

            {/* Wordmark */}
            <div className="flex flex-col items-center mb-1">
              <div className="h-36 w-36 md:h-50 md:w-50 shrink-0">
                <img
                  src="/logo2.png"
                  alt="Coral Acessórios Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-bold text-center leading-tight mb-5"
              style={{
                color: C.noir,
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.02em",
                maxWidth: "640px",
              }}
            >
              O detalhe que{" "}
              <span style={{ fontStyle: "italic", color: C.red1 }}>faz a diferença.</span>
            </h1>

            <p className="text-sm font-light text-center leading-relaxed mb-10 max-w-md"
              style={{ color: C.noir }}>
              Acessórios femininos premium para a mulher que se expressa pelo que escolhe.
              Cada peça, uma intenção.
            </p>

            <div className="flex flex-row items-center gap-3 justify-center">
              <button
                onClick={() => setLocation("/catalogo")}
                className="flex items-center justify-center text-[11px] font-medium tracking-[0.3em] uppercase px-6 py-3.5 transition hover:opacity-85 rounded-full h-[52px] w-[168px]"
                style={{
                  background: `linear-gradient(135deg, ${C.red1} 0%, ${C.red2} 100%)`,
                  color: C.white,
                  border: "none",
                  boxShadow: "0 12px 28px rgba(253,110,94,0.30)",
                }}
              >
                Ver coleção
              </button>
              <button
                onClick={goWhatsApp}
                className="flex items-center justify-center text-[11px] font-medium tracking-[0.3em] uppercase px-6 py-3.5 transition hover:opacity-80 rounded-full h-[52px] w-[168px]"
                style={{
                  backgroundColor: C.pink1,
                  color: C.red2,
                  border: `1px solid ${C.pink2}55`,
                }}
              >
                Atendimento
              </button>
            </div>

          </div>
        </header>

        {/* ── MAIN ─────────────────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col gap-16 sm:gap-24">

          {/* Carrossel */}
          <BestSellersCarousel />

          {/* Divider */}
          <div className="flex items-center gap-6">
            <div className="flex-1 h-px" style={{ backgroundColor: C.bege2 }} />
          </div>

          {/* ── Editorial Content Block ────────────────────────────────── */}
          <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 px-6 rounded-3xl relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${C.red1} 0%, ${C.red2} 100%)` }}>

            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)" }} />

            {/* Left: Text content */}
            <div className="relative flex flex-col justify-center">
              <p className="text-[9px] tracking-[0.45em] uppercase font-light mb-4"
                style={{ color: "rgba(255,255,255,0.65)" }}>
                Essência da Marca
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
                style={{
                  color: C.white,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: "-0.02em"
                }}>
                Curadoria com Propósito
              </h2>
              <p className="text-sm leading-relaxed mb-6 max-w-sm"
                style={{ color: "rgba(255,255,255,0.80)" }}>
                Cada peça é cuidadosamente selecionada para contar uma história. Acreditamos que acessórios são mais do que adornos—são extensões da personalidade. Qualidade artesanal com design intemporal.
              </p>
              <button
                onClick={() => setLocation("/catalogo")}
                className="relative self-start inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.4em] uppercase transition hover:opacity-80 px-8 py-3 rounded-full"
                style={{
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: C.white,
                  background: "rgba(255,255,255,0.10)"
                }}>
                Descobrir coleção <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Right: Editorial image */}
            <div className="relative w-full h-[350px] sm:h-[400px] rounded-2xl overflow-hidden"
              style={{
                boxShadow: `0 12px 32px rgba(0, 0, 0, 0.15)`
              }}>
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=700&fit=crop"
                alt="Detalhe de acessórios Coral"
                className="w-full h-full object-cover"
              />
            </div>
          </section>

          {/* ── Localização ─────────────────────────────────────────── */}
          <section className="w-full py-16 px-6 rounded-3xl" style={{ background: C.bege1 }}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] tracking-[0.45em] uppercase" style={{ color: C.red1 }}>
                  Localização
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-bold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: C.noir }}
                >
                  Visite a loja
                </h2>
                <p className="text-justify leading-relaxed max-w-sm" style={{ color: C.noir }}>
                  Estamos em um espaço pensado para receber você com atenção e conforto.
                  Venha conhecer nossas peças pessoalmente.
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: C.noir }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: C.red1 }} />
                    Manhattan River Center  - Av. Senador Area Leão, 2185               
                </div>
              </div>

              <div
                className="w-full h-[280px] rounded-2xl overflow-hidden relative"
                style={{ boxShadow: "0 16px 40px rgba(253,110,94,0.12)" }}
              >
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: C.bege1, color: C.bege3 }}>
                    <p className="text-xs tracking-widest uppercase">Carregando mapa...</p>
                  </div>
                )}
                <iframe
                  src={`https://www.google.com/maps?q=${MAPS_ADDRESS}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  onLoad={() => setMapReady(true)}
                />
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer
          className="w-full py-12 px-6"
          style={{ borderTop: `1px solid ${C.bege2}`, background: C.white }}
        >
          <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-1">
            <div className="h-8 w-8 md:h-12 md:w-12 shrink-0">
              <img
                src="/logo.png"
                alt="Coral Acessórios Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col items-center gap-2 mt-2">
              <a
                href="https://instagram.com/coralacessoriospi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-light tracking-wider hover:opacity-60 transition"
                style={{ color: C.noir }}
              >
                <Instagram className="w-4 h-4" />
                @coralacessoriospi
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-light tracking-wider hover:opacity-60 transition"
                style={{ color: C.noir }}
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-light" style={{ color: C.bege3 }}>
              © 2026 Coral Acessórios · Todos os direitos reservados
            </p>
          </div>
        </footer>

        {/* WhatsApp flutuante */}
        <button
          onClick={goWhatsApp}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition hover:scale-105 cursor-pointer"
          style={{
            backgroundColor: "#25D366",
            color: "white",
            boxShadow: `0 12px 32px rgba(37, 211, 102, 0.3), inset 0 0 0 3px ${C.bege1}`
          }}
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
