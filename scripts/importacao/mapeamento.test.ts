import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { mapearTudo, montarDescricao, mapearCategoria, resumir, urlsDoProduto, type ProdutosJson } from "./mapeamento";

const MD = "mariadolores.com.br";
const ES = "eussol.com.br";

const dados: ProdutosJson = {
  itens_por_link: [
    { url: "md-a", descricao: "Desc A", medidas: "Banho: Ouro\nPeso: 3g", imagens: [{ url: "a1" }, { url: "a2" }] },
    { url: "md-b", descricao: "Desc B", medidas: null, imagens: [{ url: "b1" }, { url: "b2" }] },
    { url: "md-c", descricao: "Desc C", medidas: "Peso: 5g", imagens: [{ url: "c1" }] },
    { url: "es-x", descricao: "Desc X", medidas: null, imagens: [{ url: "x-dour" }, { url: "x-geral" }, { url: "x-prata" }] },
  ],
  produtos_agrupados: [
    {
      grupo_id: "md-md103", fonte: MD, marca: "Maria Dolores", modelo_codigo: "MD103", nome_base: "Brinco Bola Facetado",
      categoria_coral_sugerida: "brincos", colecoes: ["Daily"],
      variacoes: [
        { rotulo: "Drusa · Ouro", codigo: "MD103.FO.26", preco: 398, imagens: ["a1", "a2"], url_origem: "md-a" },
        { rotulo: "Olho de Tigre · Ouro", codigo: "MD103.FO.84", preco: 390, imagens: ["b1", "b2"], url_origem: "md-b" },
      ],
    },
    {
      grupo_id: "md-md1912", fonte: MD, marca: "Maria Dolores", modelo_codigo: "MD1912", nome_base: "Anel Girassol",
      categoria_coral_sugerida: "aneis", colecoes: ["Ser Girassol"],
      variacoes: [{ rotulo: "Cristal · Ouro", codigo: "MD1912.FO.882", preco: 1015, disponivel: false, imagens: ["c1"], url_origem: "md-c" }],
    },
    {
      grupo_id: "es-x", fonte: ES, marca: "Eu Sol", modelo_codigo: "ES-x", nome_base: "Brinco Flor Pétit",
      categoria_coral_sugerida: "brincos", colecoes: [],
      variacoes: [
        { rotulo: "Prata", codigo: "1", preco: 169, disponivel: false, imagens: ["x-prata"], url_origem: "es-x" },
        { rotulo: "Dourado", codigo: "2", preco: 169, imagens: ["x-dour"], url_origem: "es-x" },
      ],
    },
  ],
};

describe("mapeamento do import", () => {
  const plano = mapearTudo(dados);
  const [bola, girassol, flor] = plano;

  it("grupo com 2+ links vira produto com variações, preço mínimo e preço próprio só quando difere", () => {
    expect(bola.slug).toBe("brinco-bola-facetado");
    expect(bola.marca).toBe("Maria Dolores");
    expect(bola.colecao).toBe("Daily");
    expect(bola.preco).toBe(390);
    expect(bola.codigo_fornecedor).toBe("MD103");
    expect(bola.variacoes.map((v) => [v.nome, v.preco, v.codigo_fornecedor])).toEqual([
      ["Drusa · Ouro", 398, "MD103.FO.26"],
      ["Olho de Tigre · Ouro", null, "MD103.FO.84"],
    ]);
    expect(bola.descricao).toBe("Desc A\n\nMedidas:\nBanho: Ouro\nPeso: 3g");
    expect(bola.variacoes[0].descricao).toBeNull();
    expect(bola.variacoes[1].descricao).toBe("Desc B");
    expect(bola.capa).toBe("a1");
    expect(bola.imagens_produto).toEqual([]);
    expect(urlsDoProduto(bola)).toEqual(["a1", "a2", "b1", "b2"]);
  });

  it("grupo com 1 link vira produto sem variação, ativo mesmo indisponível no fornecedor", () => {
    expect(girassol.variacoes).toEqual([]);
    expect(girassol.ativo).toBe(true);
    expect(girassol.codigo_fornecedor).toBe("MD1912.FO.882");
    expect(girassol.categoria).toBe("aneis");
    expect(girassol.capa).toBe("c1");
  });

  it("Eu Sol vira Ssôl, todas as variações ativas, galeria geral sem as fotos das cores", () => {
    expect(flor.marca).toBe("Ssôl");
    expect(flor.colecao).toBeNull();
    expect(flor.codigo_fornecedor).toBeNull();
    expect(flor.variacoes.every((v) => v.ativo)).toBe(true);
    expect(flor.variacoes.map((v) => v.preco)).toEqual([null, null]);
    expect(flor.capa).toBe("x-prata");
    expect(flor.imagens_produto).toEqual(["x-geral"]);
  });

  it("categoria fora da lista do banco é recusada; 'anel' vira 'aneis'", () => {
    expect(mapearCategoria("anel")).toBe("aneis");
    expect(() => mapearCategoria("cintos")).toThrow();
  });

  it("descrição sem medidas fica como está", () => {
    expect(montarDescricao({ descricao: " Texto ", medidas: null })).toBe("Texto");
  });

  it("resumo por categoria", () => {
    const r = resumir(plano);
    expect(r.produtos).toBe(3);
    expect(r.variacoes).toBe(4);
    expect(r.porCategoria.brincos.produtos).toBe(2);
  });

  // Conferência com o levantamento real, quando o arquivo estiver disponível.
  const real = process.env.PRODUTOS_JSON;
  it.skipIf(!real || !fs.existsSync(real))("produtos.json real: 66 produtos, slugs únicos, tudo ativo", () => {
    const p = mapearTudo(JSON.parse(fs.readFileSync(real!, "utf8")));
    expect(p).toHaveLength(66);
    expect(new Set(p.map((x) => x.slug)).size).toBe(66);
    expect(p.every((x) => x.ativo && x.variacoes.every((v) => v.ativo))).toBe(true);
    expect(p.every((x) => x.descricao.trim().length > 0)).toBe(true);
    const totalLinks = p.reduce((s, x) => s + Math.max(1, x.variacoes.length), 0);
    expect(totalLinks).toBe(104);
  });
});

describe("medidas de modelo", () => {
  it("'MEDIDA' do fornecedor não vira bloco Medidas", () => {
    expect(montarDescricao({ descricao: "Texto", medidas: "MEDIDA" })).toBe("Texto");
  });
});
