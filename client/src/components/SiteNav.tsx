import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { LINKS_NAVEGACAO, TEXTO_FAIXA_AVISO, hrefDoLink } from "@/config/navegacao";
import CartButton from "@/features/cart/CartButton";
import { C, FONT_SANS } from "@/lib/coralTheme";

/** Altura da barra, em px. A Home usa para puxar o hero para baixo dela. */
export const ALTURA_NAV = 44;

/**
 * Barra fina de categorias (fixa no topo ao rolar) + faixa de aviso.
 * No celular os links rolam na horizontal, sem barra de rolagem visível,
 * e a sacola fica sempre à direita.
 *
 * sobreHero: na Home, a barra fica transparente por cima do fundo do hero
 * (acima da logo) e só ganha fundo creme depois de rolar.
 */
export default function SiteNav({ sobreHero = false }: { sobreHero?: boolean }) {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    if (!sobreHero) return;
    const onScroll = () => setRolou(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sobreHero]);
  const transparente = sobreHero && !rolou;

  const [location] = useLocation();
  const search = useSearch();
  const categoriaAtual = location === "/catalogo" ? new URLSearchParams(search).get("categoria") ?? "" : null;

  return (
    <>
      <nav
        aria-label="Categorias"
        data-transparente={transparente ? "1" : "0"}
        className="sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-300"
        style={{
          fontFamily: FONT_SANS,
          background: transparente ? "transparent" : "rgba(250,245,237,0.92)",
          backdropFilter: transparente ? "none" : "blur(10px)",
          WebkitBackdropFilter: transparente ? "none" : "blur(10px)",
          borderTop: `1px solid ${transparente ? "rgba(51,51,51,0.14)" : C.bege2}`,
          borderBottom: `1px solid ${transparente ? "rgba(51,51,51,0.14)" : C.bege2}`,
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center pl-2 pr-2 sm:px-6" style={{ height: ALTURA_NAV - 2 }}>
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
