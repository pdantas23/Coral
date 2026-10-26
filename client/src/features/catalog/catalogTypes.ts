// ─── Categorias ───────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "brincos",
  "colares",
  "pulseiras",
  "aneis",
  "bolsas",
  "outros",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Label de exibição para cada categoria
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  brincos:   "Brincos",
  colares:   "Colares",
  pulseiras: "Pulseiras",
  aneis:      "Anéis",
  bolsas:    "Bolsas",
  outros:    "Outros",
};

// ─── Imagem adicional ─────────────────────────────────────────────────────────

export type ProductImage = {
  id: string;
  produto_id: string;
  variacao_id?: string | null;  // null = imagem do produto
  url: string;       // URL pública montada pelo service
  ordem: number;
};

// ─── Variação ─────────────────────────────────────────────────────────────────

export type ProductVariation = {
  id: string;
  produto_id: string;
  nome: string;
  descricao: string | null;       // null = usa a do produto
  preco: number | null;           // null = usa o do produto
  codigo_fornecedor: string | null;
  ordem: number;
  ativo: boolean;
  imagens: ProductImage[];
  created_at?: string;
  updated_at?: string;
};

export type VariationPayload = {
  nome: string;
  descricao?: string | null;
  preco?: number | null;
  codigo_fornecedor?: string | null;
  ordem?: number;
  ativo?: boolean;
  imagens_paths?: string[];
};

// ─── Produto ──────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string | null;
  imagens: ProductImage[];   // imagens adicionais do produto (sem variação)
  variacoes?: ProductVariation[];  // opcional: API antiga não manda
  marca?: string | null;
  colecao?: string | null;
  slug?: string | null;
  codigo_fornecedor?: string | null;
  categoria: ProductCategory | null;
  promocao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

// ─── Payloads ─────────────────────────────────────────────────────────────────

export type CreateProductPayload = {
  nome: string;
  descricao: string;
  preco: number;
  imagem_url?: string | null;
  imagens_paths?: string[];   // paths das imagens adicionais
  categoria?: ProductCategory | null;
  promocao?: boolean;
  ativo?: boolean;
  marca?: string | null;
  colecao?: string | null;
  slug?: string | null;
  codigo_fornecedor?: string | null;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ─── Listagem ─────────────────────────────────────────────────────────────────

export type ListProductsParams = {
  search?: string;
  promocao?: boolean;
  ativo?: boolean;
};

export type ListProductsResponse = {
  data: Product[];
  total: number;
};