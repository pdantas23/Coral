import { describe, expect, it } from "vitest";
import type { Product, ProductVariation } from "./catalogTypes";
import { faixaDePreco, galeria, nomeComVariacao, precoEfetivo, variacoesVisiveis, codigoEfetivo, descricaoEfetiva } from "./variantUtils";

function variacao(p: Partial<ProductVariation>): ProductVariation {
  return { id: "v", produto_id: "p", nome: "V", descricao: null, preco: null, codigo_fornecedor: null, ordem: 0, ativo: true, imagens: [], ...p };
}

const base: Product = {
  id: "p", nome: "Brinco Bola Facetado", descricao: "desc do produto", preco: 390,
  imagem_url: "capa.webp", imagens: [{ id: "i1", produto_id: "p", url: "geral.webp", ordem: 0 }],
  categoria: "brincos", promocao: false, ativo: true, created_at: "", updated_at: "",
  codigo_fornecedor: "MD103",
};

describe("regra de preço da variação", () => {
  it("preço nulo usa o do produto; preço próprio vale", () => {
    expect(precoEfetivo(base, variacao({ preco: null }))).toBe(390);
    expect(precoEfetivo(base, variacao({ preco: 398 }))).toBe(398);
    expect(precoEfetivo(base, variacao({ preco: 0 }))).toBe(0);
    expect(precoEfetivo(base, null)).toBe(390);
  });

  it("faixa de preço considera só variações ativas", () => {
    const p = { ...base, variacoes: [
      variacao({ id: "a", preco: null, ordem: 0 }),
      variacao({ id: "b", preco: 398, ordem: 1 }),
      variacao({ id: "c", preco: 900, ordem: 2, ativo: false }),
    ] };
    expect(faixaDePreco(p)).toEqual({ min: 390, max: 398 });
    expect(variacoesVisiveis(p).map((v) => v.id)).toEqual(["a", "b"]);
    expect(faixaDePreco(base)).toEqual({ min: 390, max: 390 });
  });

  it("código, descrição, nome e galeria seguem a variação", () => {
    const v = variacao({ id: "b", nome: "Olho de Tigre · Folheado a Ouro", codigo_fornecedor: "MD103.FO.84", descricao: "desc da variação",
      imagens: [{ id: "x", produto_id: "p", variacao_id: "b", url: "var.webp", ordem: 0 }] });
    expect(codigoEfetivo(base, v)).toBe("MD103.FO.84");
    expect(codigoEfetivo(base, null)).toBe("MD103");
    expect(descricaoEfetiva(base, v)).toBe("desc da variação");
    expect(descricaoEfetiva(base, variacao({}))).toBe("desc do produto");
    expect(nomeComVariacao(base.nome, v.nome)).toBe("Brinco Bola Facetado (Olho de Tigre · Folheado a Ouro)");
    expect(nomeComVariacao(base.nome, null)).toBe("Brinco Bola Facetado");
    expect(galeria(base, v)).toEqual(["var.webp", "geral.webp"]);
    expect(galeria(base, variacao({}))).toEqual(["capa.webp", "geral.webp"]);
    expect(galeria(base, null)).toEqual(["capa.webp", "geral.webp"]);
  });
});
