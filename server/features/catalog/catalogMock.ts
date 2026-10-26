/**
 * Modo mock do catálogo, só para desenvolvimento local.
 *
 * Com CATALOG_MOCK=<caminho de um .json> no ambiente, GET /api/products e
 * GET /api/products/:id leem desse arquivo, e toda escrita responde 503.
 * Nada vai para o Supabase. O arquivo é gerado pelo script de importação:
 *   npx tsx scripts/importar-produtos.ts --gerar-mock <saida.json>
 */
import fs from "node:fs";
import type { ListProductsParams, ListProductsResponse, Product } from "./catalogTypes";

export function isCatalogMock(): boolean {
  return !!process.env.CATALOG_MOCK?.trim();
}

let cache: { file: string; mtime: number; data: Product[] } | null = null;

function load(): Product[] {
  const file = process.env.CATALOG_MOCK!.trim();
  const mtime = fs.statSync(file).mtimeMs;
  if (cache && cache.file === file && cache.mtime === mtime) return cache.data;
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const data = (Array.isArray(raw) ? raw : raw.data) as Product[];
  cache = { file, mtime, data };
  return data;
}

function soAtivas(p: Product): Product {
  return { ...p, variacoes: (p.variacoes ?? []).filter((v) => v.ativo) };
}

export function mockListProducts(params: ListProductsParams = {}): ListProductsResponse {
  let items = load();
  if (params.search?.trim()) {
    const s = params.search.trim().toLowerCase();
    items = items.filter((p) => p.nome.toLowerCase().includes(s) || p.descricao.toLowerCase().includes(s));
  }
  if (params.promocao !== undefined) items = items.filter((p) => p.promocao === params.promocao);
  if (params.ativo !== undefined) items = items.filter((p) => p.ativo === params.ativo);
  if (params.ativo === true) items = items.map(soAtivas);
  return { data: items, total: items.length };
}

export function mockGetProduct(idOrSlug: string): Product | null {
  return load().find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}
