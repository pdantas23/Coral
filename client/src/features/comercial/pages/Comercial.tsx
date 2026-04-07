import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  listProducts,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
  deleteProduct,
} from "@/features/catalog/catalogApi";
import { Plus, Pencil, Trash2, X, ImagePlus, Loader2, Star, CheckCircle2 } from "lucide-react";
import type { Product, CreateProductPayload } from "@/features/catalog/catalogTypes";
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from "@/features/catalog/catalogTypes";
import CategoryDropdown from "@/components/CategoryDropdown";

// ─── Paleta Coral ─────────────────────────────────────────────────────────────
const C = {
  red1:    "#FD6E5E",
  red2:    "#CC4834",
  pink1:   "#FEEDED",
  pink2:   "#FFADA2",
  noir:    "#333333",
  bege1:   "#EDE8E1",
  bege2:   "#DED6BF",
  bege3:   "#C8C1AC",
  owhite:  "#FAF5ED",
  white:   "#FFFFFF",
} as const;



// ─── Tipos internos ───────────────────────────────────────────────────────────

type UploadedImage = {
  id: string;
  path: string;
  previewUrl: string;
  uploading: boolean;
  error: string;
};

type FormState = {
  nome: string;
  descricao: string;
  preco: string;
  categoria: (typeof PRODUCT_CATEGORIES)[number] | null;
  promocao: boolean;
  ativo: boolean;
};

const EMPTY_FORM: FormState = {
  nome: "", descricao: "", preco: "", categoria: null, promocao: false, ativo: true,
};

function makeId() { return Math.random().toString(36).slice(2); }

function extractPath(url: string): string {
  const marker = "/object/public/products_coral/";
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : url;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Comercial() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [search, setSearch]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  function handleImageError(productId: string) {
    setImageErrors((prev) => new Set([...prev, productId]));
  }

  function isImageValid(product: Product): boolean {
    // ✅ CORRIGIDO: Verificar se url existe E é string válida ANTES de chamar trim()
    return !!(
      product.imagem_url
      && typeof product.imagem_url === "string"
      && product.imagem_url.trim().length > 0
      && !imageErrors.has(product.id)
    );
  }

  const [modalOpen, setModalOpen]             = useState(false);
  const [editingProduct, setEditingProduct]   = useState<Product | null>(null);
  const [formLoading, setFormLoading]         = useState(false);
  const [formError, setFormError]             = useState("");
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [form, setForm]     = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef        = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeModal(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  async function loadProducts() {
    setIsLoading(true); setPageError("");
    try {
      const result = await listProducts({ ativo: undefined });
      setProducts(result.data);
    } catch { setPageError("Não foi possível carregar os produtos."); }
    finally { setIsLoading(false); }
  }

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return p.nome.toLowerCase().includes(s) || p.descricao.toLowerCase().includes(s);
  });

  function openCreate() {
    setEditingProduct(null); setForm(EMPTY_FORM); setImages([]); setFormError(""); setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product); setFormError(""); setImageErrors(new Set());  // ✅ Limpar erros ao abrir
    setForm({ nome: product.nome, descricao: product.descricao, preco: String(product.preco),
               categoria: product.categoria ?? null, promocao: product.promocao, ativo: product.ativo });
    const list: UploadedImage[] = [];
    if (product.imagem_url)
      list.push({ id: makeId(), path: extractPath(product.imagem_url), previewUrl: product.imagem_url, uploading: false, error: "" });
    for (const img of product.imagens ?? [])
      list.push({ id: makeId(), path: extractPath(img.url), previewUrl: img.url, uploading: false, error: "" });
    setImages(list); setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false); setEditingProduct(null); setForm(EMPTY_FORM);
    setImages([]); setFormError(""); setRemovingImageId(null); setImageErrors(new Set());  // ✅ Limpar erros ao fechar
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    const newImages: UploadedImage[] = files.map((file) => ({
      id: makeId(), path: "", previewUrl: URL.createObjectURL(file), uploading: true, error: "",
    }));
    setImages((prev) => [...prev, ...newImages]);
    await Promise.all(
      newImages.map(async (img, i) => {
        try {
          const path = await uploadProductImage(files[i]);
          setImages((prev) => prev.map((p) => p.id === img.id ? { ...p, path, uploading: false } : p));
        } catch (err) {
          setImages((prev) => prev.map((p) => p.id === img.id
            ? { ...p, uploading: false, error: err instanceof Error ? err.message : "Erro no upload" } : p));
        }
      })
    );
  }

  async function removeImage(id: string) {
    const target = images.find((img) => img.id === id);
    if (!target) return;

    try {
      setRemovingImageId(id);
      setFormError("");

      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Não foi possível remover a imagem."
      );
    } finally {
      setRemovingImageId(null);
    }
  }

  function setCover(id: string) {
    setImages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  }

  const anyUploading = images.some((i) => i.uploading);
  const isDisabled   = formLoading || anyUploading;
  const coverImage   = images[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (anyUploading || formLoading) return;
    setFormLoading(true);
    setFormError("");

    const preco = Number(String(form.preco).replace(",", "."));
    if (Number.isNaN(preco) || preco < 0) {
      setFormError("Informe um preço válido.");
      setFormLoading(false);
      return;
    }

    const ready = images.filter((i) => i.path && !i.error);
    const [capa, ...extras] = ready;

    // ⭐ LÓGICA DE DELEÇÃO VOLUNTÁRIA E PRESERVAÇÃO
    // Rastrear se a imagem foi removida (lista vazia mas tinha imagem original)
    const hadCoverImage = !!editingProduct?.imagem_url;
    const hasCoverImage = !!capa;
    const imageWasRemoved = hadCoverImage && !hasCoverImage;

    // Lógica de controle:
    // 1. Se há nova imagem: enviar novo path (substitui)
    // 2. Se removeu imagem voluntariamente: enviar null (deleta no BD)
    // 3. Se preserva original intacta: enviar undefined (PATCH não altera)
    const imageUrlPayload = capa
      ? capa.path  // ⭐ Nova imagem: usar path relativo do servidor
      : imageWasRemoved
      ? null  // ⭐ REMOVEU voluntariamente: enviar null para deletar no BD
      : undefined;  // ⭐ Preserva original: não enviar (PATCH não sobrescreve)

    // Mesma lógica para imagens adicionais
    const hadExtraImages = !!editingProduct?.imagens?.length;
    const hasExtraImages = extras.length > 0;
    const extrasWereRemoved = hadExtraImages && !hasExtraImages;

    const imagesPathsPayload = extras.length > 0
      ? extras.map((i) => i.path)  // ⭐ Novas imagens: usar paths relativos
      : extrasWereRemoved
      ? []  // ⭐ REMOVEU voluntariamente: enviar array vazio (deleta extras)
      : undefined;  // ⭐ Preserva originais: não enviar

    const payload: CreateProductPayload = {
      nome: form.nome,
      descricao: form.descricao,
      preco,
      imagem_url: imageUrlPayload,
      imagens_paths: imagesPathsPayload,
      categoria: form.categoria,
      promocao: form.promocao,
      ativo: form.ativo,
    };

    try {
      if (editingProduct) {
        // ⭐ Se está deletando imagem original, remover do storage também
        if (imageWasRemoved && editingProduct.imagem_url) {
          try {
            const oldPath = extractPath(editingProduct.imagem_url);
            if (oldPath) await deleteProductImage(oldPath);
          } catch (err) {
            console.warn("Erro ao remover imagem do storage:", err);
            // Não bloquear a edição se storage falhar
          }
        }

        // ⭐ Se está deletando imagens extras, remover todas do storage
        if (extrasWereRemoved && editingProduct.imagens?.length) {
          try {
            for (const img of editingProduct.imagens ?? []) {  // ✅ Adicionar ?? [] por segurança
              const oldPath = extractPath(img.url);
              if (oldPath) await deleteProductImage(oldPath);
            }
          } catch (err) {
            console.warn("Erro ao remover imagens extras do storage:", err);
          }
        }

        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar produto.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o produto "${product.nome}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    try {
      setDeletingProductId(product.id);
      setPageError("");

      await deleteProduct(product.id);

      setProducts((prev) => prev.filter((p) => p.id !== product.id));

      if (editingProduct?.id === product.id) {
        closeModal();
      }
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o produto."
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: C.noir, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Produtos
          </h1>
          <p className="text-xs font-light" style={{ color: C.bege3 }}>
            Cadastre, edite e gerencie os acessórios da coleção
          </p>
        </div>

        {/* Busca + botão */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 sm:items-center">
          <div className="relative flex-grow">
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full py-2.5 pl-3 pr-4 text-xs font-light outline-none transition rounded-sm"
              style={{
                border: `1px solid ${C.bege2}`,
                backgroundColor: C.white,
                color: C.noir,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.red1)}
              onBlur={(e) => (e.target.style.borderColor = C.bege2)}
            />
          </div>
          <button
            type="button" onClick={openCreate}
            className="flex items-center justify-center gap-2 py-2.5 px-5 text-[11px] font-medium tracking-[0.25em] uppercase transition hover:opacity-85 rounded-sm flex-shrink-0"
            style={{ backgroundColor: C.red1, color: C.white, border: "none", cursor: "pointer" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo produto
          </button>
        </div>

        {pageError && (
          <div className="px-4 py-3 text-xs font-light rounded-sm"
            style={{ backgroundColor: C.pink1, color: C.red2, border: `1px solid ${C.pink2}` }}>
            {pageError}
          </div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: C.bege2, borderTopColor: C.red1 }} />
            <p className="text-[10px] tracking-[0.35em] uppercase font-light" style={{ color: C.bege3 }}>
              Carregando...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xs font-light" style={{ color: C.bege3 }}>
              {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="flex flex-row gap-6 rounded-lg transition hover:shadow-md p-6"
                style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.white, minHeight: "200px" }}
              >
                {/* COLUMN 1: IMAGE (Left) */}
                <div
                  className="shrink-0 flex items-center justify-center overflow-hidden rounded-xl relative"
                  style={{
                    width: "120px",
                    height: "160px",
                    backgroundColor: C.bege1,
                  }}
                >
                  {isImageValid(product)
                    ? <img
                        src={product.imagem_url || ""}
                        alt={product.nome}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(product.id)}
                      />
                    : <span className="text-[9px] font-light tracking-widest uppercase" style={{ color: C.bege3 }}>Foto</span>
                  }
                  {(product.imagens?.length ?? 0) > 0 && (
                    <div className="absolute bottom-2 right-2 px-1.5 text-[8px] font-light"
                      style={{ backgroundColor: "rgba(0,0,0,0.50)", color: C.white }}>
                      +{(product.imagens?.length ?? 0)}
                    </div>
                  )}
                </div>

                {/* COLUMN 2: INFO (Center) - Flex grow */}
                <div className="flex-grow min-w-0 flex flex-col gap-2 justify-center">
                  {/* Badge + Title same line */}
                  <div className="flex flex-col gap-1.5">
                    {/* A tag (Badge) agora fica em cima */}
                    <div className="flex gap-2">
                      {product.promocao && (
                        <span 
                          className="text-[9px] tracking-widest uppercase font-medium px-2.5 py-1 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: C.red1, color: C.white }}
                        >
                          Destaque
                        </span>
                      )}
                      {!product.ativo && (
                        <span 
                          className="text-[9px] tracking-widest uppercase font-light px-2.5 py-1 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: C.bege1, color: C.bege3 }}
                        >
                          Inativo
                        </span>
                      )}
                    </div>

                    {/* O título fica logo abaixo */}
                    <p 
                      className="text-sm md:text-base font-medium truncate" 
                      style={{ color: C.noir, fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {product.nome}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm font-light truncate" style={{ color: C.bege3 }}>
                    {product.descricao}
                  </p>

                  {/* Price + Category */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm md:text-base font-medium" style={{ color: C.red1 }}>
                      R$ {product.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                {/* COLUMN 3: ACTIONS (Right) - Stacked & Centered */}
                <div className="flex flex-col gap-3 justify-center shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    disabled={deletingProductId === product.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-[10px] font-light tracking-[0.2em] uppercase transition hover:opacity-60 rounded-sm disabled:opacity-40"
                    style={{
                      color: C.noir,
                      border: `1px solid ${C.bege2}`,
                      background: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                    disabled={deletingProductId === product.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-[10px] font-light tracking-[0.2em] uppercase transition hover:opacity-60 rounded-sm disabled:opacity-40"
                    style={{
                      color: C.red2,
                      border: `1px solid ${C.pink2}`,
                      background: C.pink1,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {deletingProductId === product.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-right text-[10px] font-light" style={{ color: C.bege3 }}>
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── MODAL ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(51,51,51,0.55)", backdropFilter: "blur(4px)" }}
          onClick={closeModal}
        >
          <div
            className="relative w-[90vw] h-[60vh] md:w-[60vw] md:h-[70vh] bg-white rounded-xl shadow-2xl"            
            style={{ boxShadow: "0 30px 80px rgba(51,51,51,0.20)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div
              className="flex items-center justify-between px-4 py-2.5 bg-white"
              style={{ borderBottom: `1px solid ${C.bege1}` }}
            >
              <div>
                <p className="text-[10px] md:text-sm font-light tracking-[0.4em] uppercase" style={{ color: C.bege3 }}>
                  {editingProduct ? "Editar produto" : "Novo produto"}
                </p>
              </div>
              <button
                type="button" onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center transition hover:opacity-50 rounded-full"
                style={{ color: C.bege3, background: C.bege1, border: "none", cursor: "pointer" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Corpo — sem scroll, tudo estático */}
            <form onSubmit={handleSubmit} className="p-3 space-y-2">
              {formError && (
                <div className="px-3 py-2 text-xs font-light rounded-sm"
                  style={{ backgroundColor: C.pink1, color: C.red2, border: `1px solid ${C.pink2}` }}>
                  {formError}
                </div>
              )}

              {/* ── IMAGENS ──────────────────────────────────────────────── */}
              <section>
                {/* Cabeçalho compacto */}
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] md:text-sm font-light tracking-[0.35em] uppercase" style={{ color: C.bege3 }}>
                    Imagens — máx. 5 MB
                  </p>
                  <span className="text-[8px] font-light" style={{ color: C.bege3 }}>
                    {images.filter(i => i.path && !i.error).length} foto(s)
                  </span>
                </div>

                {/* Tira horizontal: capa + miniaturas + botão adicionar */}
                <div className="flex items-center gap-2">
                  {/* Preview capa */}
                  <div
                    className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden flex items-center justify-center rounded-sm"
                    style={{
                      backgroundColor: C.bege1,
                      border: `2px dashed ${coverImage?.previewUrl ? C.red1 : C.bege2}`,
                    }}
                  >
                    {coverImage?.previewUrl ? (
                      <>
                        <img src={coverImage.previewUrl} alt="Capa" className="h-full w-full object-cover" />
                        {coverImage.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        )}
                        <div
                          className="absolute top-1 left-1 px-1.5 py-0.5 text-[7px] font-medium tracking-widest uppercase rounded-sm"
                          style={{ backgroundColor: C.red1, color: C.white }}
                        >
                          Capa
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImagePlus className="h-5 w-5" style={{ color: C.bege3 }} />
                        <span className="text-[8px] font-light" style={{ color: C.bege3 }}>Sem capa</span>
                      </div>
                    )}
                  </div>

                  {/* Miniaturas + botão adicionar em linha */}
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-sm"
                        style={{
                          border: `2px solid ${idx === 0 ? C.red1 : C.bege2}`,
                          backgroundColor: C.bege1,
                        }}
                      >
                        <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                        {img.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                          </div>
                        )}
                        {img.error && (
                          <div className="absolute inset-0 flex items-center justify-center p-0.5" style={{ backgroundColor: "rgba(180,50,50,0.7)" }}>
                            <span className="text-[7px] text-white text-center leading-tight">{img.error}</span>
                          </div>
                        )}
                        {!img.uploading && !img.error && img.path && idx !== 0 && (
                          <div className="absolute bottom-0.5 right-0.5">
                            <CheckCircle2 className="h-3 w-3 drop-shadow" style={{ color: "#6ee7b7" }} />
                          </div>
                        )}
                        {!img.uploading && (
                          <div className="absolute right-0.5 top-0.5 flex flex-col gap-0.5">
                            <button
                              type="button" onClick={() => removeImage(img.id)}
                              disabled={removingImageId === img.id}
                              className="flex h-4 w-4 items-center justify-center transition hover:opacity-70 disabled:opacity-40 rounded-full"
                              style={{ backgroundColor: "rgba(0,0,0,0.55)", color: C.white, border: "none", cursor: "pointer" }}
                            >
                              {removingImageId === img.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <X className="h-2.5 w-2.5" />}
                            </button>
                            {idx !== 0 && img.path && (
                              <button
                                type="button" onClick={() => setCover(img.id)}
                                className="flex h-4 w-4 items-center justify-center transition hover:opacity-70 rounded-full"
                                style={{ backgroundColor: "rgba(0,0,0,0.55)", color: C.white, border: "none", cursor: "pointer" }}
                              >
                                <Star className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Botão adicionar */}
                    <div>
                      <input
                        ref={fileInputRef} type="file" accept="image/*" multiple
                        onChange={handleFileChange} disabled={isDisabled}
                        className="hidden" id="comercial-images-input"
                      />
                      <label
                        htmlFor="comercial-images-input"
                        className={`flex h-20 w-20 md:h-24 md:w-24 flex-col items-center justify-center gap-0.5 cursor-pointer transition hover:opacity-70 rounded-sm ${isDisabled ? "pointer-events-none opacity-40" : ""}`}
                        style={{ border: `2px dashed ${C.bege2}`, backgroundColor: C.bege1 }}
                      >
                        <ImagePlus className="h-4 w-4" style={{ color: C.bege3 }} />
                        <span className="text-[7px] font-light text-center" style={{ color: C.bege3 }}>
                          {anyUploading ? "..." : "+"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── DADOS ───────────────────────────────────────────────── */}
              <section className="space-y-2">
                {/* Nome */}
                <div>
                  <label className="block text-[10px] md:text-sm tracking-[0.3em] uppercase font-light mb-1" style={{ color: C.bege3 }}>
                    Nome *
                  </label>
                  <input
                    type="text" value={form.nome} onChange={(e) => setField("nome", e.target.value)}
                    required placeholder="Ex: Colar Dourado"
                    className="w-full h-10 py-1.5 px-3 text-xs font-light outline-none transition rounded-sm"
                    style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                    onFocus={(e) => (e.target.style.borderColor = C.red1)}
                    onBlur={(e) => (e.target.style.borderColor = C.bege2)}
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-[10px] md:text-sm tracking-[0.3em] uppercase font-light mb-1" style={{ color: C.bege3 }}>
                    Descrição *
                  </label>
                  <textarea
                    value={form.descricao} onChange={(e) => setField("descricao", e.target.value)}
                    required rows={1} placeholder="Descreva o produto..."
                    className="w-full h-10 flex items-center resize-none py-2.5 px-3 text-xs font-light outline-none transition rounded-sm"                    style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                    onFocus={(e) => (e.target.style.borderColor = C.red1)}
                    onBlur={(e) => (e.target.style.borderColor = C.bege2)}
                  />
                </div>

                {/* Preço acima, Categoria abaixo (mobile); lado a lado no desktop */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] md:text-sm tracking-[0.3em] uppercase font-light mb-1" style={{ color: C.bege3 }}>
                      Preço (R$) *
                    </label>
                    <input
                      type="text" value={form.preco} onChange={(e) => setField("preco", e.target.value)}
                      required placeholder="0,00"
                      className="flex items-center w-full py-1.5 px-3 text-xs font-light outline-none transition h-10 rounded-sm"
                      style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                      onFocus={(e) => (e.target.style.borderColor = C.red1)}
                      onBlur={(e) => (e.target.style.borderColor = C.bege2)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-sm tracking-[0.3em] uppercase font-light mb-1" style={{ color: C.bege3 }}>
                      Categoria
                    </label>
                    <CategoryDropdown
                      value={form.categoria ?? ""}
                      onChange={(value) => setField("categoria", value ? (value as FormState["categoria"]) : null)}
                      options={[
                        { value: "", label: "Sem categoria" },
                        ...PRODUCT_CATEGORIES.map((cat) => ({
                          value: cat,
                          label: CATEGORY_LABELS[cat],
                        })),
                      ]}
                    />
                  </div>
                </div>

                {/* Checkboxes — sempre em linha */}
                <div className="flex flex-row justify-start flex-wrap gap-x-4 gap-y-3 pb-3 pt-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox" checked={form.promocao} onChange={(e) => setField("promocao", e.target.checked)}
                      className="h-5 w-5" style={{ accentColor: C.red1 }}
                    />
                    <span className="text-[11px] font-light" style={{ color: C.noir }}>Marcar como destaque</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox" checked={form.ativo} onChange={(e) => setField("ativo", e.target.checked)}
                      className="h-5 w-5" style={{ accentColor: C.red1 }}
                    />
                    <span className="text-[11px] font-light" style={{ color: C.noir }}>Ativo no catálogo</span>
                  </label>
                </div>
              </section>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: `1px solid ${C.bege1}` }}>
                {!formLoading && (
                  <button
                    type="button" onClick={closeModal} disabled={anyUploading}
                    className="flex h-8 items-center justify-center px-4 text-[10px] font-medium tracking-[0.2em] uppercase transition disabled:opacity-40 cursor-pointer rounded-sm"
                    style={{
                      backgroundColor: "transparent",
                      color: C.noir,
                      border: `1px solid ${C.bege2}`,
                    }}
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="submit" disabled={formLoading || anyUploading}
                  className="relative flex h-8 items-center justify-center gap-1.5 px-4 text-[10px] font-medium uppercase transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-sm"
                  style={{
                    backgroundColor: C.red1,
                    color: C.white,
                    border: "none",
                    letterSpacing: "0.2em",
                  }}
                >
                  {(formLoading || anyUploading) && (
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                  )}
                  <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {formLoading
                      ? "Salvando..."
                      : anyUploading
                      ? "Aguardando uploads..."
                      : editingProduct
                      ? "Salvar alterações"
                      : "Cadastrar produto"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
