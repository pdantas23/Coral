/**
 * Importação dos produtos do levantamento (produtos.json) para a Coral.
 *
 * Uso:
 *   npx tsx scripts/importar-produtos.ts --json <produtos.json> [--env <arquivo .env>]
 *       Simulação (padrão). Não escreve nada. Se houver chaves, só LÊ o banco
 *       para dizer o que já existe.
 *
 *   ... --executar [--log <arquivo>] [--limite N] [--so <slug>,<slug>]
 *       Baixa as imagens, converte para WebP (lado maior até 1600 px),
 *       sobe no bucket images-coral (produtos/<timestamp>-<aleatório>.webp)
 *       e grava produto, variações e imagens. Pula o que já existe (slug).
 *       Grava um log que permite desfazer.
 *
 *   ... --desfazer --log <arquivo> [--executar]
 *       Lê o log e mostra (ou, com --executar, faz) a remoção de tudo o que
 *       aquela importação criou: linhas de imagem, variações, produtos e
 *       arquivos do storage.
 *
 *   ... --gerar-mock <saida.json>
 *       Gera o JSON do modo mock da API (CATALOG_MOCK) com as URLs do
 *       fornecedor. Não usa banco nem storage.
 *
 * Pré-requisito do --executar: migration 001_variacoes_coral.sql aplicada.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  mapearTudo,
  resumir,
  urlsDoProduto,
  type PlanoProduto,
  type ProdutosJson,
} from "./importacao/mapeamento";

const BUCKET = "images-coral";
const T_PROD = "produtos_coral";
const T_VARS = "produtos_variacoes_coral";
const T_IMGS = "produtos_imagens_coral";
const PAUSA_MS = 1000;
const LADO_MAX = 1600;
const QUALIDADE = 82;

// ─── Argumentos ──────────────────────────────────────────────────────────────
type Args = {
  json?: string;
  env?: string;
  executar: boolean;
  desfazer: boolean;
  log?: string;
  limite?: number;
  so?: string[];
  gerarMock?: string;
};

function lerArgs(argv: string[]): Args {
  const a: Args = { executar: false, desfazer: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const prox = () => {
      const v = argv[++i];
      if (!v) throw new Error(`Falta o valor de ${k}`);
      return v;
    };
    if (k === "--json") a.json = prox();
    else if (k === "--env") a.env = prox();
    else if (k === "--executar") a.executar = true;
    else if (k === "--dry-run") a.executar = false;
    else if (k === "--desfazer") a.desfazer = true;
    else if (k === "--log") a.log = prox();
    else if (k === "--limite") a.limite = Number(prox());
    else if (k === "--so") a.so = prox().split(",").map((s) => s.trim()).filter(Boolean);
    else if (k === "--gerar-mock") a.gerarMock = prox();
    else throw new Error(`Argumento desconhecido: ${k}`);
  }
  return a;
}

function cliente(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Log ─────────────────────────────────────────────────────────────────────
type LogProduto = {
  slug: string;
  grupo_id: string;
  status: "criado" | "pulado" | "erro" | "desfeito";
  produto_id?: string;
  variacao_ids?: string[];
  imagem_ids?: string[];
  storage_paths?: string[];
  erro?: string;
};
type Log = { iniciado_em: string; json: string; produtos: LogProduto[] };

function salvarLog(arquivo: string, log: Log) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify(log, null, 2));
}

// ─── Leitura do que já existe (só SELECT) ────────────────────────────────────
async function slugsExistentes(sb: SupabaseClient, slugs: string[]): Promise<{ ok: boolean; existentes: Set<string>; aviso?: string }> {
  const { data, error } = await sb.from(T_PROD).select("slug").in("slug", slugs);
  if (error) return { ok: false, existentes: new Set(), aviso: error.message };
  return { ok: true, existentes: new Set((data ?? []).map((r: any) => r.slug)) };
}

// ─── Simulação ───────────────────────────────────────────────────────────────
async function simular(plano: PlanoProduto[]) {
  const r = resumir(plano);
  console.log("\n=== SIMULAÇÃO (--dry-run): nada foi gravado ===\n");
  console.log(`Produtos: ${r.produtos} | Variações: ${r.variacoes} | Imagens (arquivos a subir): ${r.imagens}`);
  console.log(`Produtos sem variação: ${plano.filter((p) => p.variacoes.length === 0).length} | com seletor: ${plano.filter((p) => p.variacoes.length > 0).length}`);
  console.log("\nPor categoria:");
  for (const [cat, c] of Object.entries(r.porCategoria).sort()) {
    console.log(`  ${cat.padEnd(10)} produtos ${String(c.produtos).padStart(3)} | variações ${String(c.variacoes).padStart(3)} | imagens ${String(c.imagens).padStart(3)}`);
  }
  console.log("\nPor marca:", Object.entries(r.porMarca).map(([m, n]) => `${m}: ${n}`).join(" | "));

  const sb = cliente();
  if (sb) {
    const ex = await slugsExistentes(sb, plano.map((p) => p.slug));
    if (!ex.ok) {
      console.log(`\nBanco (só leitura): não deu para checar slugs (${ex.aviso}). Provável: migration 001 ainda não aplicada.`);
    } else {
      console.log(`\nBanco (só leitura): ${ex.existentes.size} dos ${plano.length} slugs já existem e seriam pulados.`);
    }
  } else {
    console.log("\nBanco: sem chaves (--env), não conferi o que já existe.");
  }

  console.log("\nLista:");
  for (const p of plano) {
    const precos = p.variacoes.length
      ? [...new Set(p.variacoes.map((v) => v.preco ?? p.preco))].map(brl).join(" / ")
      : brl(p.preco);
    console.log(`  [${p.categoria}] ${p.slug} | ${p.nome} | ${p.marca} | ${p.colecao ?? "sem coleção"} | ${precos} | ${p.variacoes.length} var. | ${urlsDoProduto(p).length} img`);
  }
}

// ─── Imagem: baixar, converter, subir ────────────────────────────────────────
async function baixarEConverter(url: string): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (importacao Coral Acessorios)" } });
  if (!resp.ok) throw new Error(`Download falhou (${resp.status}): ${url}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  return sharp(buf)
    .rotate()
    .resize({ width: LADO_MAX, height: LADO_MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALIDADE })
    .toBuffer();
}

function novoPath(): string {
  return `produtos/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
}

// ─── Execução ────────────────────────────────────────────────────────────────
async function importarUm(sb: SupabaseClient, p: PlanoProduto, entrada: LogProduto, salvar: () => void) {
  entrada.storage_paths = [];
  entrada.variacao_ids = [];
  entrada.imagem_ids = [];

  // 1. imagens (uma por vez, com pausa)
  const pathPorUrl = new Map<string, string>();
  for (const url of urlsDoProduto(p)) {
    const webp = await baixarEConverter(url);
    const destino = novoPath();
    const { error } = await sb.storage.from(BUCKET).upload(destino, webp, { contentType: "image/webp", upsert: false });
    if (error) throw new Error(`Upload falhou (${destino}): ${error.message}`);
    pathPorUrl.set(url, destino);
    entrada.storage_paths.push(destino);
    salvar();
    await dormir(PAUSA_MS);
  }

  // 2. produto
  const { data: prod, error: e1 } = await sb
    .from(T_PROD)
    .insert([{
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      imagem_url: p.capa ? pathPorUrl.get(p.capa) ?? null : null,
      categoria: p.categoria,
      promocao: p.promocao,
      ativo: p.ativo,
      marca: p.marca,
      colecao: p.colecao,
      slug: p.slug,
      codigo_fornecedor: p.codigo_fornecedor,
    }])
    .select("id")
    .single();
  if (e1) throw new Error(`Insert produto: ${e1.message}`);
  entrada.produto_id = prod.id;
  salvar();

  // 3. imagens do produto (sem variação); a capa fica em imagem_url
  const extras = p.imagens_produto.filter((u) => u !== p.capa);
  if (extras.length) {
    const { data, error } = await sb
      .from(T_IMGS)
      .insert(extras.map((u, i) => ({ produto_id: prod.id, path: pathPorUrl.get(u)!, ordem: i })))
      .select("id");
    if (error) throw new Error(`Insert imagens do produto: ${error.message}`);
    entrada.imagem_ids.push(...(data ?? []).map((r: any) => r.id));
  }

  // 4. variações e suas imagens
  for (const v of p.variacoes) {
    const { data: vr, error: e2 } = await sb
      .from(T_VARS)
      .insert([{
        produto_id: prod.id,
        nome: v.nome,
        descricao: v.descricao,
        preco: v.preco,
        codigo_fornecedor: v.codigo_fornecedor,
        ordem: v.ordem,
        ativo: v.ativo,
      }])
      .select("id")
      .single();
    if (e2) throw new Error(`Insert variação ${v.nome}: ${e2.message}`);
    entrada.variacao_ids.push(vr.id);

    if (v.imagens.length) {
      const { data, error } = await sb
        .from(T_IMGS)
        .insert(v.imagens.map((u, i) => ({ produto_id: prod.id, variacao_id: vr.id, path: pathPorUrl.get(u)!, ordem: i })))
        .select("id");
      if (error) throw new Error(`Insert imagens da variação ${v.nome}: ${error.message}`);
      entrada.imagem_ids.push(...(data ?? []).map((r: any) => r.id));
    }
    salvar();
  }
}

async function desfazerUm(sb: SupabaseClient, e: LogProduto) {
  if (e.produto_id) {
    const { error: ei } = await sb.from(T_IMGS).delete().eq("produto_id", e.produto_id);
    if (ei) throw new Error(`Apagar imagens: ${ei.message}`);
    const { error: ep } = await sb.from(T_PROD).delete().eq("id", e.produto_id); // variações: cascade
    if (ep) throw new Error(`Apagar produto: ${ep.message}`);
  }
  if (e.storage_paths?.length) {
    const { error: es } = await sb.storage.from(BUCKET).remove(e.storage_paths);
    if (es) throw new Error(`Apagar arquivos: ${es.message}`);
  }
}

async function executar(plano: PlanoProduto[], args: Args, jsonPath: string) {
  const sb = cliente();
  if (!sb) throw new Error("Sem SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use --env).");

  const ex = await slugsExistentes(sb, plano.map((p) => p.slug));
  if (!ex.ok) throw new Error(`Não deu para ler slugs (${ex.aviso}). A migration 001 foi aplicada?`);

  const arquivoLog = args.log ?? path.join("scripts", "logs", `importacao-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const log: Log = { iniciado_em: new Date().toISOString(), json: jsonPath, produtos: [] };
  const salvar = () => salvarLog(arquivoLog, log);
  console.log(`Log: ${arquivoLog}`);

  for (const p of plano) {
    if (ex.existentes.has(p.slug)) {
      log.produtos.push({ slug: p.slug, grupo_id: p.grupo_id, status: "pulado" });
      salvar();
      console.log(`= ${p.slug}: já existe, pulado`);
      continue;
    }
    const entrada: LogProduto = { slug: p.slug, grupo_id: p.grupo_id, status: "erro" };
    log.produtos.push(entrada);
    try {
      await importarUm(sb, p, entrada, salvar);
      entrada.status = "criado";
      salvar();
      console.log(`+ ${p.slug}: criado (${entrada.variacao_ids?.length ?? 0} var., ${entrada.storage_paths?.length ?? 0} img)`);
    } catch (err) {
      entrada.erro = err instanceof Error ? err.message : String(err);
      console.error(`! ${p.slug}: ${entrada.erro}. Desfazendo só este produto e parando.`);
      try {
        await desfazerUm(sb, entrada);
        entrada.status = "desfeito";
      } catch (e2) {
        console.error(`  Falhou desfazer automático: ${e2 instanceof Error ? e2.message : e2}. Use --desfazer com o log.`);
      }
      salvar();
      process.exitCode = 1;
      return;
    }
  }
  console.log(`\nFim. Log em ${arquivoLog}`);
}

async function desfazer(args: Args) {
  if (!args.log) throw new Error("--desfazer precisa de --log <arquivo>");
  const log = JSON.parse(fs.readFileSync(args.log, "utf8")) as Log;
  const alvos = log.produtos.filter((e) => e.produto_id || e.storage_paths?.length);
  alvos.forEach((e) => {
    if (e.status === "desfeito") return;
    console.log(`${args.executar ? "-" : "(simulação) -"} ${e.slug}: produto ${e.produto_id ?? "nenhum"}, ${e.variacao_ids?.length ?? 0} var., ${e.storage_paths?.length ?? 0} arquivos`);
  });
  if (!args.executar) {
    console.log("\nSimulação. Para desfazer de verdade: --desfazer --log <arquivo> --executar");
    return;
  }
  const sb = cliente();
  if (!sb) throw new Error("Sem chaves (use --env).");
  for (const e of alvos) {
    if (e.status === "desfeito") continue;
    await desfazerUm(sb, e);
    e.status = "desfeito";
    salvarLog(args.log, log);
  }
  console.log("Desfeito.");
}

// ─── Mock para o dev ─────────────────────────────────────────────────────────
export function planoParaMock(plano: PlanoProduto[]) {
  const agora = new Date().toISOString();
  return plano.map((p, i) => {
    const id = `mock-${p.slug}`;
    const img = (url: string, ordem: number, variacao_id: string | null) => ({
      id: `${id}-img-${variacao_id ?? "p"}-${ordem}`,
      produto_id: id,
      variacao_id,
      url,
      ordem,
    });
    return {
      id,
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      imagem_url: p.capa,
      imagens: p.imagens_produto.filter((u) => u !== p.capa).map((u, k) => img(u, k, null)),
      variacoes: p.variacoes.map((v) => {
        const vid = `${id}-v${v.ordem}`;
        return {
          id: vid,
          produto_id: id,
          nome: v.nome,
          descricao: v.descricao,
          preco: v.preco,
          codigo_fornecedor: v.codigo_fornecedor,
          ordem: v.ordem,
          ativo: v.ativo,
          imagens: v.imagens.map((u, k) => img(u, k, vid)),
          created_at: agora,
          updated_at: agora,
        };
      }),
      marca: p.marca,
      colecao: p.colecao,
      slug: p.slug,
      codigo_fornecedor: p.codigo_fornecedor,
      categoria: p.categoria,
      promocao: p.promocao,
      ativo: p.ativo,
      created_at: new Date(Date.now() - i * 1000).toISOString(),
      updated_at: agora,
    };
  });
}

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = lerArgs(process.argv.slice(2));
  if (args.env) dotenv.config({ path: args.env, quiet: true } as any);

  if (args.desfazer) return desfazer(args);

  if (!args.json) throw new Error("Informe --json <caminho do produtos.json>");
  const dados = JSON.parse(fs.readFileSync(args.json, "utf8")) as ProdutosJson;
  let plano = mapearTudo(dados);
  if (args.so) plano = plano.filter((p) => args.so!.includes(p.slug));
  if (args.limite) plano = plano.slice(0, args.limite);

  if (args.gerarMock) {
    fs.writeFileSync(args.gerarMock, JSON.stringify(planoParaMock(plano), null, 2));
    console.log(`Mock gerado: ${args.gerarMock} (${plano.length} produtos)`);
    return;
  }

  if (!args.executar) return simular(plano);
  return executar(plano, args, args.json);
}

const ehCli = process.argv[1] && path.resolve(process.argv[1]).endsWith(path.join("scripts", "importar-produtos.ts"));
if (ehCli) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
