import { describe, expect, it } from "vitest";
import {
  adicionarItem,
  alterarQuantidade,
  lerCarrinhoSalvo,
  montarMensagemCarrinho,
  removerItem,
  subtotal,
  totalDeItens,
  type NovoItem,
} from "./cartUtils";

const bola: NovoItem = {
  produtoId: "p1",
  variacaoId: "v-olho",
  nome: "Brinco Bola Facetado",
  marca: "Maria Dolores",
  variacaoNome: "Olho de Tigre · Folheado a Ouro",
  codigo: "MD103.FO.84",
  precoUnitario: 390,
  imagem: null,
};
const belle: NovoItem = {
  produtoId: "p2",
  variacaoId: null,
  nome: "Brinco Belle",
  marca: "Ssôl",
  variacaoNome: null,
  codigo: "217054800",
  precoUnitario: 369,
  imagem: null,
};

describe("carrinho", () => {
  it("soma quantidade do mesmo produto e variação, separa variações diferentes", () => {
    let c = adicionarItem([], bola, 1);
    c = adicionarItem(c, bola, 2);
    c = adicionarItem(c, { ...bola, variacaoId: "v-drusa", precoUnitario: 398 }, 1);
    expect(c).toHaveLength(2);
    expect(c[0].quantidade).toBe(3);
    expect(totalDeItens(c)).toBe(4);
    expect(subtotal(c)).toBe(390 * 3 + 398);
  });

  it("alterar para 0 remove; remover tira o item; quantidade tem teto", () => {
    let c = adicionarItem([], bola, 1);
    c = alterarQuantidade(c, c[0].chave, 500);
    expect(c[0].quantidade).toBe(99);
    expect(alterarQuantidade(c, c[0].chave, 0)).toHaveLength(0);
    expect(removerItem(c, c[0].chave)).toHaveLength(0);
  });

  it("ignora lixo no localStorage", () => {
    expect(lerCarrinhoSalvo(null)).toEqual([]);
    expect(lerCarrinhoSalvo("{quebrado")).toEqual([]);
    expect(lerCarrinhoSalvo(JSON.stringify([{ nome: "sem id" }, { ...bola, quantidade: 2 }]))).toHaveLength(1);
  });
});

describe("mensagem do WhatsApp", () => {
  it("lista nome, marca, variação, código, quantidade, preço e total", () => {
    let c = adicionarItem([], bola, 2);
    c = adicionarItem(c, belle, 1);
    const msg = montarMensagemCarrinho(c);
    expect(msg).toBe(
      [
        "Olá! Tenho interesse nas peças abaixo. Pode me passar mais informações?",
        "",
        "1. *Brinco Bola Facetado*",
        "Marca: Maria Dolores",
        "Variação: Olho de Tigre · Folheado a Ouro",
        "Código: MD103.FO.84",
        "Quantidade: 2",
        "Preço: R$ 390,00 cada, R$ 780,00 no total",
        "",
        "2. *Brinco Belle*",
        "Marca: Ssôl",
        "Código: 217054800",
        "Quantidade: 1",
        "Preço: R$ 369,00",
        "",
        "*Total: R$ 1.149,00*",
      ].join("\n")
    );
  });

  it("não usa travessão", () => {
    const msg = montarMensagemCarrinho(adicionarItem([], bola, 1));
    expect(msg).not.toMatch(/[–—]/);
    expect(msg.startsWith("Olá! Tenho interesse na peça abaixo.")).toBe(true);
  });
});
