/**
 * Escolha dos produtos de uma seção em bento. Pura e estável: a mesma
 * lista de produtos sempre gera a mesma vitrine.
 *
 * Critério automático (decisão do Philip): do mais caro para o mais barato.
 * Preço considerado = o maior entre o do produto e o das variações ativas.
 * Empate: nome em ordem alfabética.
 *
 * Os slugs da configuração (config/vitrines.ts) vêm antes, na ordem dada.
 * O resultado está em ordem de TAMANHO de bloco: [grande, médio, médio,
 * pequeno, pequeno, ...]. ordemNaGrade() converte para a ordem do HTML.
 */
import type { Product, ProductCategory } from "./catalogTypes";
import { faixaDePreco } from "./variantUtils";

export function maiorPreco(p: Product): number {
  return Math.max(Number(p.preco), faixaDePreco(p).max);
}

function comparar(a: Product, b: Product): number {
  const d = maiorPreco(b) - maiorPreco(a);
  if (d !== 0) return d;
  return a.nome.localeCompare(b.nome, "pt-BR");
}

export function selecionarVitrine(
  produtos: Product[],
  categoria: ProductCategory,
  slugsFixos: string[],
  total: number
): Product[] {
  const daCategoria = produtos.filter((p) => p.ativo !== false && p.categoria === categoria);
  const escolhidos: Product[] = [];
  for (const slug of slugsFixos) {
    const p = daCategoria.find((x) => x.slug === slug || x.id === slug);
    if (p && !escolhidos.includes(p)) escolhidos.push(p);
  }
  const resto = daCategoria.filter((p) => !escolhidos.includes(p)).sort(comparar);
  return [...escolhidos, ...resto].slice(0, total);
}

/**
 * Posição de cada bloco no HTML do bento (ver POSICAO em VitrinesBento):
 *   0 grande, 1 médio (alto), 2 pequeno, 3 pequeno, 4 médio (largo), 5 e 6 pequenos.
 * Recebe a lista por tamanho e devolve na ordem da grade.
 */
export const TAMANHO_POR_POSICAO = ["grande", "medio", "pequeno", "pequeno", "medio", "pequeno", "pequeno"] as const;

export function ordemNaGrade<T>(porTamanho: T[]): T[] {
  // índices, na lista por tamanho, de quem vai em cada posição da grade
  const mapa = [0, 1, 3, 4, 2, 5, 6];
  return mapa.map((i) => porTamanho[i]).filter((x): x is T => x !== undefined);
}
