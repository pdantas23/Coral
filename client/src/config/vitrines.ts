/**
 * Seções em bento grid da página inicial (depois de "Mais Vendidos").
 * Edite aqui. A ordem do array é a ordem na página.
 *
 * slugs: produtos escolhidos à mão, na ordem. O 1º vira o bloco grande.
 *        Vazio = escolha automática: do mais caro para o mais barato
 *        (o mais caro no bloco grande, os 2 seguintes nos médios).
 *        Se tiver menos de 7, o resto é completado automaticamente.
 */
import type { ProductCategory } from "@/features/catalog/catalogTypes";

export type Vitrine = {
  categoria: ProductCategory;
  rotulo: string;      // texto pequeno acima do título
  titulo: string;
  linkTexto: string;   // link do fim da seção
  slugs: string[];
};

export const VITRINES: Vitrine[] = [
  { categoria: "brincos", rotulo: "Coleção", titulo: "Brincos", linkTexto: "Ver todos os brincos", slugs: [] },
  { categoria: "aneis",   rotulo: "Coleção", titulo: "Anéis",   linkTexto: "Ver todos os anéis",   slugs: [] },
];

/**
 * Quantos produtos cada bento mostra no desktop e no tablet
 * (1 grande + 2 médios + 4 pequenos). No celular aparecem os 5 primeiros
 * (1 grande + 4), para a página não ficar longa.
 */
export const ITENS_POR_VITRINE = 7;

/**
 * Carrossel "Mais Vendidos" (destaques), no topo da página inicial.
 *
 * slugs: produtos escolhidos à mão, na ordem. Vazio = automático.
 * Automático: alterna as categorias abaixo (um de cada por vez), do mais caro
 * para o mais barato dentro de cada uma, sem repetir o que já aparece nos
 * blocos de Brincos e Anéis.
 */
export const DESTAQUES = {
  slugs: [] as string[],
  total: 12,
  categorias: ["colares", "brincos", "aneis", "pulseiras"] as ProductCategory[],
};
