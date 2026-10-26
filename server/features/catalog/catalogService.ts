import { createSupabaseAdminClient } from "../../lib/supabase";
import type {
  Product,
  ProductImage,
  CreateProductPayload,
  UpdateProductPayload,
  ListProductsParams,
  ListProductsResponse,
} from "./catalogTypes";

const STORAGE_BUCKET = "images-coral";
const TABLE          = "produtos_coral";
const TABLE_IMGS     = "produtos_imagens_coral";

// ─── Helper: URL pública ──────────────────────────────────────────────────────
export function getPublicImageUrl(supabaseUrl: string, path: string | null): string | null {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

// ─── Upload de imagem ─────────────────────────────────────────────────────────
export async function uploadProductImageService(file: Express.Multer.File): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const ext      = file.originalname.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `produtos/${filename}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw new Error(`Erro no upload: ${error.message}`);
  return filePath;
}

// ─── Helper: buscar imagens adicionais de vários produtos ────────────────────
async function fetchImagens(supabase: ReturnType<typeof createSupabaseAdminClient>, supabaseUrl: string, produtoIds: string[]): Promise<Record<string, ProductImage[]>> {
  if (produtoIds.length === 0) return {};

  const { data, error } = await supabase
    .from(TABLE_IMGS)
    .select("id, produto_id, path, ordem")
    .in("produto_id", produtoIds)
    .order("ordem", { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, ProductImage[]> = {};
  for (const row of data ?? []) {
    if (!map[row.produto_id]) map[row.produto_id] = [];
    map[row.produto_id].push({
      id:        row.id,
      produto_id: row.produto_id,
      url:       getPublicImageUrl(supabaseUrl, row.path)!,
      ordem:     row.ordem,
    });
  }
  return map;
}

// ─── Helper: salvar imagens adicionais ───────────────────────────────────────
async function saveImagens(supabase: ReturnType<typeof createSupabaseAdminClient>, produtoId: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const rows = paths.map((path, i) => ({ produto_id: produtoId, path, ordem: i }));
  const { error } = await supabase.from(TABLE_IMGS).insert(rows);
  if (error) throw new Error(error.message);
}

// ─── Helper: remover imagem do storage ───────────────────────────────────────
async function removeImagem(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) throw new Error(error.message);
}


// ─── Service: remover imagem do produto ──────────────────────────────────────
export async function deleteProductImageService(path: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await removeImagem(supabase, path);
}

// ─── Helper: substituir imagens adicionais ───────────────────────────────────
async function replaceImagens(supabase: ReturnType<typeof createSupabaseAdminClient>, produtoId: string, paths: string[]): Promise<void> {
  await supabase.from(TABLE_IMGS).delete().eq("produto_id", produtoId);
  await saveImagens(supabase, produtoId, paths);
}

// ─── Helper: Extrair path relativo de uma URL pública ─────────────────────
function extractRelativePath(urlOrPath: string | null): string | null {
  if (!urlOrPath) return null;

  // Se for uma URL pública completa, extrair o path relativo
  const storageMarker = "/storage/v1/object/public/" + STORAGE_BUCKET + "/";
  const idx = urlOrPath.indexOf(storageMarker);
  if (idx >= 0) {
    return urlOrPath.slice(idx + storageMarker.length);
  }

  // Se for um path relativo puro, retornar como está
  if (!urlOrPath.startsWith("http")) {
    return urlOrPath;
  }

  // ⭐ Se for alguma outra URL desconhecida, retornar null por segurança
  return null;
}

// ─── Listar produtos ──────────────────────────────────────────────────────────
export async function listProductsService(params: ListProductsParams = {}): Promise<ListProductsResponse> {
  const supabase    = createSupabaseAdminClient();
  const supabaseUrl = process.env.SUPABASE_URL!;

  let query = supabase.from(TABLE).select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (params.search?.trim()) {
    const s = params.search.trim();
    query = query.or(`nome.ilike.*${s}*,descricao.ilike.*${s}*`);
  }
  if (params.promocao !== undefined) query = query.eq("promocao", params.promocao);
  if (params.ativo    !== undefined) query = query.eq("ativo",    params.ativo);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const ids    = (data ?? []).map((r: any) => r.id);
  const imgMap = await fetchImagens(supabase, supabaseUrl, ids);

  const products = (data ?? []).map((row: any) => ({
    ...row,
    imagem_url: row.imagem_url ? getPublicImageUrl(supabaseUrl, row.imagem_url) : null,
    imagens:    imgMap[row.id] ?? [],
  })) as Product[];

  return { data: products, total: count ?? 0 };
}

// ─── Buscar por ID ────────────────────────────────────────────────────────────
export async function getProductByIdService(id: string): Promise<Product> {
  const supabase    = createSupabaseAdminClient();
  const supabaseUrl = process.env.SUPABASE_URL!;

  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message);

  const imgMap = await fetchImagens(supabase, supabaseUrl, [id]);

  return {
    ...data,
    imagem_url: data.imagem_url ? getPublicImageUrl(supabaseUrl, data.imagem_url) : null,
    imagens:    imgMap[id] ?? [],
  } as Product;
}

// ─── Criar produto ────────────────────────────────────────────────────────────
export async function createProductService(payload: CreateProductPayload): Promise<Product> {
  const supabase    = createSupabaseAdminClient();
  const supabaseUrl = process.env.SUPABASE_URL!;

  // ⭐ CHAVE: Sanitizar imagem_url - sempre salvar PATH RELATIVO, nunca URL completa
  const cleanImageUrl = payload.imagem_url
    ? extractRelativePath(payload.imagem_url)
    : null;

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      nome:       payload.nome.trim(),
      descricao:  payload.descricao.trim(),
      preco:      payload.preco,
      imagem_url: cleanImageUrl ?? null,  // ⭐ Armazena path relativo ou null
      categoria:  payload.categoria  ?? null,
      promocao:   payload.promocao   ?? false,
      ativo:      payload.ativo      ?? true,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // ⭐ CHAVE: Sanitizar paths nas imagens adicionais
  if (payload.imagens_paths?.length) {
    const cleanPaths = payload.imagens_paths
      .map((path) => extractRelativePath(path))
      .filter((path): path is string => path !== null);
    if (cleanPaths.length > 0) {
      await saveImagens(supabase, data.id, cleanPaths);
    }
  }

  const imgMap = await fetchImagens(supabase, supabaseUrl, [data.id]);

  return {
    ...data,
    imagem_url: data.imagem_url ? getPublicImageUrl(supabaseUrl, data.imagem_url) : null,
    imagens:    imgMap[data.id] ?? [],
  } as Product;
}

// ─── Atualizar produto ────────────────────────────────────────────────────────
export async function updateProductService(id: string, payload: UpdateProductPayload): Promise<Product> {
  const supabase    = createSupabaseAdminClient();
  const supabaseUrl = process.env.SUPABASE_URL!;

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (payload.nome       !== undefined) updateData.nome       = payload.nome.trim();
  if (payload.descricao  !== undefined) updateData.descricao  = payload.descricao.trim();
  if (payload.preco      !== undefined) updateData.preco      = payload.preco;

  // ⭐ CHAVE: Permitir DELEÇÃO VOLUNTÁRIA (null) e salvar PATHS RELATIVOS
  // Regra: undefined = preserva original, null = deleta no BD, string = sanitiza e salva
  if (payload.imagem_url !== undefined) {
    if (payload.imagem_url === null) {
      updateData.imagem_url = null;  // ⭐ Deleção voluntária: atualizar para null
    } else {
      const cleanPath = extractRelativePath(payload.imagem_url);
      if (cleanPath) {
        updateData.imagem_url = cleanPath;  // ⭐ Salvar path relativo sanitizado
      }
    }
  }

  if (payload.categoria  !== undefined) updateData.categoria  = payload.categoria;
  if (payload.promocao   !== undefined) updateData.promocao   = payload.promocao;
  if (payload.ativo      !== undefined) updateData.ativo      = payload.ativo;

  const { data, error } = await supabase.from(TABLE).update(updateData).eq("id", id).select().single();
  if (error) throw new Error(error.message);

  // ⭐ CHAVE: Sanitizar paths nas imagens adicionais
  if (payload.imagens_paths !== undefined) {
    const cleanPaths = payload.imagens_paths
      .map((path) => extractRelativePath(path))
      .filter((path): path is string => path !== null);
    await replaceImagens(supabase, id, cleanPaths);
  }

  const imgMap = await fetchImagens(supabase, supabaseUrl, [id]);

  return {
    ...data,
    imagem_url: data.imagem_url ? getPublicImageUrl(supabaseUrl, data.imagem_url) : null,
    imagens:    imgMap[id] ?? [],
  } as Product;
}

// ─── Excluir produto ─────────────────────────────────────────────────────────
export async function deleteProductService(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  // buscar produto
  const { data: produto, error } = await supabase
    .from(TABLE)
    .select("imagem_url")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  // buscar imagens adicionais
  const { data: imagens } = await supabase
    .from(TABLE_IMGS)
    .select("path")
    .eq("produto_id", id);

  const paths: string[] = [];

  if (produto?.imagem_url) {
    paths.push(produto.imagem_url);
  }

  for (const img of imagens ?? []) {
    if (img.path) paths.push(img.path);
  }

  // remover imagens do storage
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

    if (storageError) throw new Error(storageError.message);
  }

  // remover registros de imagens
  await supabase
    .from(TABLE_IMGS)
    .delete()
    .eq("produto_id", id);

  // remover produto
  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (deleteError) throw new Error(deleteError.message);
}
