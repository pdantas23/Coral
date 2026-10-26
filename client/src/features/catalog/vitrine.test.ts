import { describe, expect, it } from "vitest";
import type { Product, ProductVariation } from "./catalogTypes";
import { maiorPreco, ordemNaGrade, selecionarVitrine, TAMANHO_POR_POSICAO } from "./vitrine";

const v = (id: string, preco: number | null = null): ProductVariation =>
  ({ id, produto_id: "x", nome: id, descricao: null, preco, codigo_fornecedor: null, ordem: 0, ativo: true, imagens: [] });
const p = (slug: string, preco: number, vars: ProductVariation[] = [], categoria: Product["categoria"] = "brincos"): Product =>
  ({ id: slug, slug, nome: slug, descricao: "", preco, imagem_url: null, imagens: [], variacoes: vars, categoria,
     promocao: false, ativo: true, created_at: "", updated_at: "" });

const lista = [
  p("barato", 100),
  p("caro", 900),
  p("variacao-cara", 200, [v("a"), v("b", 950)]),
  p("medio", 300, [v("a"), v("b"), v("c")]),
  p("anel", 5000, [], "aneis"),
];

describe("vitrine em bento", () => {
  it("maior preço considera as variações", () => {
    expect(maiorPreco(lista[2])).toBe(950);
    expect(maiorPreco(lista[0])).toBe(100);
  });
  it("automático: do mais caro para o mais barato, só da categoria", () => {
    expect(selecionarVitrine(lista, "brincos", [], 7).map((x) => x.slug))
      .toEqual(["variacao-cara", "caro", "medio", "barato"]);
  });
  it("é estável e respeita o total", () => {
    expect(selecionarVitrine([...lista].reverse(), "brincos", [], 2).map((x) => x.slug))
      .toEqual(["variacao-cara", "caro"]);
  });
  it("slugs da configuração vêm primeiro; slug inexistente ou de outra categoria é ignorado", () => {
    expect(selecionarVitrine(lista, "brincos", ["barato", "nao-existe", "anel"], 3).map((x) => x.slug))
      .toEqual(["barato", "variacao-cara", "caro"]);
  });
  it("na grade, o 1º vai no bloco grande, o 2º e o 3º nos médios", () => {
    const grade = ordemNaGrade(["p1", "p2", "p3", "p4", "p5", "p6", "p7"]);
    expect(grade).toEqual(["p1", "p2", "p4", "p5", "p3", "p6", "p7"]);
    expect(grade.map((x, i) => [x, TAMANHO_POR_POSICAO[i]]).filter(([, t]) => t !== "pequeno").map(([x]) => x))
      .toEqual(["p1", "p2", "p3"]);
    expect(ordemNaGrade(["a", "b"])).toEqual(["a", "b"]);
  });
});
