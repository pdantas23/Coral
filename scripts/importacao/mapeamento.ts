/**
 * Mapeamento puro (sem rede, sem banco) de produtos.json para o formato
 * da Coral: produto + variações + imagens de origem.
 *
 * Regras (decisões do Philip, 26/10/2026):
 *   - só os produtos e variações que estão nos 99 links (produtos_agrupados);
 *   - preço e descrição do fornecedor, como estão (descrição + bloco "Medidas:");
 *   - marca "Maria Dolores" ou "Ssôl" (o levantamento grava "Eu Sol");
 *   - TODOS ativos, inclusive o que o fornecedor marca como indisponível;
 *   - grupo com 1 variação vira produto sem variação (o código e as fotos
 *     ficam no produto); grupo com 2+ vira produto com seletor.
 *   - preço do produto = menor preço das variações; a variação só guarda
 *     preço próprio quando ele é diferente (NULL = usa o do produto).
 */
import { slugify } from "../../shared/slug";

// Lista do CHECK de produtos_coral.categoria no banco.
export const CATEGORIAS_ACEITAS = ["brincos", "colares", "pulseiras", "aneis", "bolsas", "outros"] as const;
export type Categoria = (typeof CATEGORIAS_ACEITAS)[number];

const MARCAS: Record<string, string> = {
  "Maria Dolores": "Maria Dolores",
  "Eu Sol": "Ssôl",
};

// ─── Tipos de entrada (subconjunto de produtos.json) ─────────────────────────
export type ImagemLink = { url: string };
export type ItemLink = {
  url: string;
  descricao: string | null;
  medidas: string | null;
  colecao?: string | null;
  imagens: ImagemLink[];
};
export type VariacaoGrupo = {
  rotulo: string;
  codigo: string | null;
  preco: number;
  disponivel?: boolean;
  imagens: string[];
  url_origem: string;
};
export type Grupo = {
  grupo_id: string;
  fonte: string;
  marca: string;
  modelo_codigo: string;
  nome_base: string;
  categoria_coral_sugerida: string;
  colecoes: string[];
  variacoes: VariacaoGrupo[];
};
export type ProdutosJson = {
  itens_por_link: ItemLink[];
  produtos_agrupados: Grupo[];
};

// ─── Tipos de saída ──────────────────────────────────────────────────────────
export type PlanoVariacao = {
  nome: string;
  descricao: string | null;   // NULL = usa a do produto
  preco: number | null;       // NULL = usa a do produto
  codigo_fornecedor: string | null;
  ordem: number;
  ativo: true;
  imagens: string[];          // URLs de origem
};

export type PlanoProduto = {
  grupo_id: string;
  slug: string;
  nome: string;
  marca: string;
  colecao: string | null;
  categoria: Categoria;
  preco: number;
  descricao: string;
  codigo_fornecedor: string | null;
  promocao: false;
  ativo: true;
  capa: string | null;        // URL de origem da capa (imagem_url)
  imagens_produto: string[];  // imagens sem variação (variacao_id NULL)
  variacoes: PlanoVariacao[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function montarDescricao(item: Pick<ItemLink, "descricao" | "medidas">): string {
  const base = (item.descricao ?? "").trim();
  const medidas = (item.medidas ?? "").trim();
  // "MEDIDA" é texto de modelo do fornecedor (Anel Capri): não vira bloco.
  if (!medidas || /^medidas?\.?$/i.test(medidas)) return base;
  return base ? `${base}\n\nMedidas:\n${medidas}` : `Medidas:\n${medidas}`;
}

export function mapearMarca(marca: string): string {
  return MARCAS[marca] ?? marca;
}

export function mapearCategoria(sugerida: string): Categoria {
  if ((CATEGORIAS_ACEITAS as readonly string[]).includes(sugerida)) return sugerida as Categoria;
  if (sugerida === "anel") return "aneis";
  throw new Error(`Categoria não aceita pelo banco: "${sugerida}"`);
}

function unicos(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

// ─── Um grupo → um produto ───────────────────────────────────────────────────
export function mapearGrupo(grupo: Grupo, linkPorUrl: Map<string, ItemLink>, slug: string): PlanoProduto {
  if (grupo.variacoes.length === 0) throw new Error(`Grupo sem variação: ${grupo.grupo_id}`);

  const item = (url: string) => {
    const it = linkPorUrl.get(url);
    if (!it) throw new Error(`Link não encontrado em itens_por_link: ${url}`);
    return it;
  };

  const primeiro = item(grupo.variacoes[0].url_origem);
  const descricaoProduto = montarDescricao(primeiro);
  const precoProduto = Math.min(...grupo.variacoes.map((v) => v.preco));
  const colecao = grupo.colecoes[0] ?? primeiro.colecao ?? null;
  const ehEuSol = grupo.fonte.includes("eussol");

  const base = {
    grupo_id: grupo.grupo_id,
    slug,
    nome: grupo.nome_base.trim(),
    marca: mapearMarca(grupo.marca),
    colecao,
    categoria: mapearCategoria(grupo.categoria_coral_sugerida),
    preco: precoProduto,
    descricao: descricaoProduto,
    promocao: false as const,
    ativo: true as const,
  };

  // ── Uma variação só: produto simples ──
  if (grupo.variacoes.length === 1) {
    const v = grupo.variacoes[0];
    const imgs = ehEuSol
      ? unicos([...v.imagens, ...primeiro.imagens.map((i) => i.url)])
      : unicos(v.imagens.length ? v.imagens : primeiro.imagens.map((i) => i.url));
    return {
      ...base,
      codigo_fornecedor: v.codigo,
      capa: imgs[0] ?? null,
      imagens_produto: imgs.slice(1),
      variacoes: [],
    };
  }

  // ── Duas ou mais: produto com seletor ──
  const variacoes: PlanoVariacao[] = grupo.variacoes.map((v, i) => {
    const desc = montarDescricao(item(v.url_origem));
    return {
      nome: v.rotulo.trim(),
      descricao: desc && desc !== descricaoProduto ? desc : null,
      preco: v.preco !== precoProduto ? v.preco : null,
      codigo_fornecedor: v.codigo,
      ordem: i,
      ativo: true,
      imagens: unicos(v.imagens),
    };
  });

  const imgsDasVariacoes = new Set(variacoes.flatMap((v) => v.imagens));
  // Eu Sol: a galeria do link mistura as cores; o que não é foto principal
  // de alguma variação fica como imagem geral do produto.
  const imagensProduto = ehEuSol
    ? unicos(primeiro.imagens.map((i) => i.url)).filter((u) => !imgsDasVariacoes.has(u))
    : [];

  return {
    ...base,
    codigo_fornecedor: ehEuSol ? null : grupo.modelo_codigo,
    capa: variacoes[0].imagens[0] ?? imagensProduto[0] ?? null,
    imagens_produto: imagensProduto,
    variacoes,
  };
}

// ─── Todos os grupos, com slug único ─────────────────────────────────────────
export function mapearTudo(dados: ProdutosJson): PlanoProduto[] {
  const linkPorUrl = new Map(dados.itens_por_link.map((l) => [l.url, l]));
  const usados = new Set<string>();

  return dados.produtos_agrupados.map((g) => {
    let slug = slugify(g.nome_base);
    if (usados.has(slug)) slug = `${slug}-${slugify(mapearMarca(g.marca))}`;
    let n = 2;
    const raiz = slug;
    while (usados.has(slug)) slug = `${raiz}-${n++}`;
    usados.add(slug);
    return mapearGrupo(g, linkPorUrl, slug);
  });
}

/** Todas as URLs de imagem de um produto, na ordem, sem repetir. */
export function urlsDoProduto(p: PlanoProduto): string[] {
  return unicos([
    ...(p.capa ? [p.capa] : []),
    ...p.imagens_produto,
    ...p.variacoes.flatMap((v) => v.imagens),
  ]);
}

export type Resumo = {
  produtos: number;
  variacoes: number;
  imagens: number;
  porCategoria: Record<string, { produtos: number; variacoes: number; imagens: number }>;
  porMarca: Record<string, number>;
};

export function resumir(plano: PlanoProduto[]): Resumo {
  const r: Resumo = { produtos: 0, variacoes: 0, imagens: 0, porCategoria: {}, porMarca: {} };
  for (const p of plano) {
    const imgs = urlsDoProduto(p).length;
    r.produtos++;
    r.variacoes += p.variacoes.length;
    r.imagens += imgs;
    const c = (r.porCategoria[p.categoria] ??= { produtos: 0, variacoes: 0, imagens: 0 });
    c.produtos++;
    c.variacoes += p.variacoes.length;
    c.imagens += imgs;
    r.porMarca[p.marca] = (r.porMarca[p.marca] ?? 0) + 1;
  }
  return r;
}
