import { Link, useLocation, useSearch } from "wouter";
import { LINKS_NAVEGACAO, TEXTO_FAIXA_AVISO, hrefDoLink } from "@/config/navegacao";
import CartButton from "@/features/cart/CartButton";
import { C, FONT_SANS } from "@/lib/coralTheme";

/**
 * Barra fina de categorias (fixa no topo ao rolar) + faixa de aviso.
 * No celular os links rolam na horizontal, sem barra de rolagem visível,
 * e a sacola fica sempre à direita.
 */
export default function SiteNav() {
  const [location] = useLocation();
  const search = useSearch();
  const categoriaAtual = location === "/catalogo" ? new URLSearchParams(search).get("categoria") ?? "" : null;

  return (
    <>
      <nav
        aria-label="Categorias"
        className="sticky top-0 z-40 w-full"
        style={{
          fontFamily: FONT_SANS,
          background: "rgba(250,245,237,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: `1px solid ${C.bege2}`,
          borderBottom: `1px solid ${C.bege2}`,
        }}
      >
        <div className="mx-auto flex h-11 w-full max-w-6xl items-center pl-2 pr-2 sm:px-6">
          {/* espaço do mesmo tamanho da sacola, para os links ficarem centralizados */}
          <div className="hidden w-9 shrink-0 sm:block" />
          <ul
            className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto px-2 sm:justify-center sm:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%)",
            }}
          >
            {LINKS_NAVEGACAO.map((link) => {
              const ativo = categoriaAtual !== null && (link.categoria ?? "") === categoriaAtual;
              return (
                <li key={link.rotulo} className="shrink-0">
                  <Link
                    href={hrefDoLink(link)}
                    className="block whitespace-nowrap py-1 text-[12px] font-light tracking-[0.06em] transition hover:opacity-60"
                    style={{
                      color: ativo ? C.red1 : C.noir,
                      borderBottom: `1px solid ${ativo ? C.red1 : "transparent"}`,
                    }}
                  >
                    {link.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
          <CartButton />
        </div>
      </nav>

      {TEXTO_FAIXA_AVISO.trim() && (
        <div
          className="w-full px-4 py-2 text-center text-[11px] font-light tracking-[0.04em]"
          style={{ fontFamily: FONT_SANS, background: C.pink1, color: C.red2, borderBottom: `1px solid ${C.bege2}` }}
        >
          {TEXTO_FAIXA_AVISO}
        </div>
      )}
    </>
  );
}
