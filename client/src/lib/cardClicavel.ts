import type { CSSProperties, KeyboardEvent } from "react";

/**
 * Props para um card inteiro clicável que contém blocos (div, p):
 * role="button", foco pelo teclado e Enter/Espaço abrem, como num botão.
 */
export function propsCardClicavel(abrir: () => void, rotulo: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": rotulo,
    onClick: abrir,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    },
  };
}

/** Anel de foco visível no padrão da Coral. */
export const FOCO_CARD =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#FD6E5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF5ED]";

/**
 * Recorte arredondado de um card com foto que cresce no hover.
 * `overflow: hidden` com `border-radius` sozinho não recorta, no Safari, um
 * filho com transform ou mix-blend-mode (vira camada própria): o canto reto da
 * foto aparece por trás do arredondamento. O clip-path com o mesmo raio força
 * o recorte, e o isolation mantém o multiply da foto dentro do card.
 *
 * clip-path e não -webkit-mask-image: a máscara também resolve, mas no WebKit
 * cada card mascarado vira uma camada à parte e o catálogo (69 cards) passou
 * de ~30 para ~60 quadros perdidos na rolagem. O clip-path não pesou.
 * Ele corta o box-shadow, por isso a sombra fica num elemento de fora.
 */
export function recorte(raio: string): CSSProperties {
  return { isolation: "isolate", clipPath: `inset(0 round ${raio})` };
}

/** Camada da sombra do hover: só a opacidade anima. Pôr dentro de um pai `group`. */
export const SOMBRA_HOVER =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none";
