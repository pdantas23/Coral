/**
 * Barra de navegação do topo e faixa de aviso.
 * Edite aqui: a ordem dos links é a ordem da barra.
 *
 * Só entram categorias que o banco aceita (CHECK de produtos_coral.categoria):
 * brincos, colares, pulseiras, aneis, bolsas, outros.
 */
import type { ProductCategory } from "@/features/catalog/catalogTypes";

export type LinkNavegacao = {
  rotulo: string;
  /** categoria do catálogo; ausente = "Ver tudo" */
  categoria?: ProductCategory;
};

export const LINKS_NAVEGACAO: LinkNavegacao[] = [
  { rotulo: "Brincos",   categoria: "brincos" },
  { rotulo: "Colares",   categoria: "colares" },
  { rotulo: "Anéis",     categoria: "aneis" },
  { rotulo: "Pulseiras", categoria: "pulseiras" },
  { rotulo: "Bolsas",    categoria: "bolsas" },
  { rotulo: "Outros",    categoria: "outros" },
  { rotulo: "Ver tudo" },
];

/**
 * Texto da faixa de aviso abaixo da barra (ex.: um cupom).
 * Vazio = a faixa não aparece.
 */
export const TEXTO_FAIXA_AVISO = "";

export function hrefDoLink(link: LinkNavegacao): string {
  return link.categoria ? `/catalogo?categoria=${link.categoria}` : "/catalogo";
}
