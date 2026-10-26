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
