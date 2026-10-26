import type { KeyboardEvent } from "react";

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
