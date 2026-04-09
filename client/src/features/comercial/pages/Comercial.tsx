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
            className="relative w-[90vw] h-[60vh] md:w-[60vw] md:h-[80vh] bg-white rounded-xl shadow-2xl"            
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

            {/* ── FORMULÁRIO COM DIMENSIONAMENTO PROPORCIONAL (SEM SCROLL) ──────────────── */}
            <form 
              onSubmit={handleSubmit} 
              className="p-[2vh] flex-1 flex flex-col justify-between overflow-hidden"
              style={{ gap: "1.5vh" }}
            >
              {formError && (
                <div className="px-[1.5vh] py-[1vh] text-[1.1vh] font-light rounded-sm shrink-0"
                  style={{ backgroundColor: C.pink1, color: C.red2, border: `1px solid ${C.pink2}` }}>
                  {formError}
                </div>
              )}

              {/* ── SEÇÃO: IMAGENS ──────────────────────────────────────────────── */}
              <section className="shrink-0">
                <div className="mb-[0.8vh] flex items-center justify-between">
                  <p className="text-[1.5vh] font-light tracking-[0.35em] uppercase" style={{ color: C.bege3 }}>
                    Imagens — máx. 5 MB
                  </p>
                  <span className="text-[1vh] font-light" style={{ color: C.bege3 }}>
                    {images.filter(i => i.path && !i.error).length} foto(s)
                  </span>
                </div>

                <div className="flex items-center gap-[1.5vh]">
                  {/* Preview Capa Proporcional */}
                  <div
                    className="relative h-[20vh] w-[20vh] shrink-0 overflow-hidden flex items-center justify-center rounded-sm"
                    style={{
                      backgroundColor: C.bege1,
                      border: `2px dashed ${coverImage?.previewUrl ? C.red1 : C.bege2}`,
                    }}
                  >
                    {coverImage?.previewUrl ? (
                      <>
                        <img src={coverImage.previewUrl} alt="Capa" className="h-full w-full object-cover" />
                        <div className="absolute top-[0.5vh] left-[0.5vh] px-[0.8vh] py-[0.3vh] text-[0.9vh] font-medium tracking-widest uppercase rounded-sm"
                          style={{ backgroundColor: C.red1, color: C.white }}>
                          Capa
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-[0.5vh]">
                        <ImagePlus className="h-[2vh] w-[2vh]" style={{ color: C.bege3 }} />
                        <span className="text-[0.9vh] font-light" style={{ color: C.bege3 }}>Sem capa</span>
                      </div>
                    )}
                  </div>

                  {/* Miniaturas em linha horizontal */}
                  <div className="flex flex-wrap gap-[0.8vh] flex-1 content-start">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative h-[12vh] w-[12vh] shrink-0 overflow-hidden rounded-sm"
                        style={{ border: `1px solid ${idx === 0 ? C.red1 : C.bege2}`, backgroundColor: C.bege1 }}>
                        <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImage(img.id)}
                          className="absolute right-[0.3vh] top-[0.3vh] flex h-[1.8vh] w-[1.8vh] items-center justify-center rounded-full"
                          style={{ backgroundColor: "rgba(0,0,0,0.55)", color: C.white }}>
                          <X className="h-[1vh] w-[1vh]" />
                        </button>
                      </div>
                    ))}

                    {/* Botão Adicionar Proporcional */}
                    <div className="h-[12vh] w-[12vh]">
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} disabled={isDisabled} className="hidden" id="modal-img-input" />
                      <label htmlFor="modal-img-input"
                        className="flex h-full w-full flex-col items-center justify-center gap-[0.3vh] cursor-pointer rounded-sm"
                        style={{ border: `1px dashed ${C.bege2}`, backgroundColor: C.bege1 }}>
                        <ImagePlus className="h-[1.5vh] w-[1.5vh]" style={{ color: C.bege3 }} />
                        <span className="text-[0.8vh] font-light" style={{ color: C.bege3 }}>{anyUploading ? "..." : "+"}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── SEÇÃO: DADOS (ALTURAS EM VH) ────────────────────────────────── */}
              <section className="flex-1 flex flex-col justify-center" style={{ gap: "1.2vh" }}>
                {/* Nome */}
                <div>
                  <label className="block text-[1.5vh] tracking-[0.3em] uppercase font-light mb-[0.4vh]" style={{ color: C.bege3 }}>Nome *</label>
                  <input type="text" value={form.nome} onChange={(e) => setField("nome", e.target.value)} required 
                    className="w-full h-[5vh] px-[1.2vh] text-[1.3vh] font-light outline-none rounded-sm transition"
                    style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-[1.5vh] tracking-[0.3em] uppercase font-light mb-[0.4vh]" style={{ color: C.bege3 }}>Descrição *</label>
                  <textarea value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} required rows={1}
                    className="w-full h-[5vh] flex items-center py-[1vh] px-[1.2vh] text-[1.3vh] font-light outline-none rounded-sm resize-none"
                    style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite, color: C.noir }}
                  />
                </div>

                {/* Preço e Categoria */}
                <div className="flex flex-col gap-[1.5vh]">
                  <div>
                    <label className="block text-[1.5vh] tracking-[0.3em] uppercase font-light mb-[0.4vh]" style={{ color: C.bege3 }}>Preço (R$) *</label>
                    <input type="text" value={form.preco} onChange={(e) => setField("preco", e.target.value)} required 
                      className="w-full h-[5vh] px-[1.2vh] text-[1.3vh] font-light outline-none rounded-sm"
                      style={{ border: `1px solid ${C.bege2}`, backgroundColor: C.owhite }}
                    />
                  </div>
                  <div>
                    <label className="block text-[1.5vh] tracking-[0.3em] uppercase font-light mb-[0.4vh]" style={{ color: C.bege3 }}>Categoria</label>
                    <div className="h-[5vh] text-[1.5vh]">
                      <CategoryDropdown
                        value={form.categoria ?? ""}
                        onChange={(val) => 
                          // Usamos 'as any' ou o tipo específico para dizer ao TS: "Eu garanto que esse valor é válido"
                          setField("categoria", val ? (val as typeof form.categoria) : null)
                        }
                        options={[
                          { value: "", label: "Sem categoria" },
                          ...PRODUCT_CATEGORIES.map(cat => ({ 
                            value: cat, 
                            label: CATEGORY_LABELS[cat] 
                          }))
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes em linha */}
                <div className="flex items-center gap-[3vh] py-[0.5vh]">
                  <label className="flex cursor-pointer items-center gap-[0.8vh]">
                    <input type="checkbox" checked={form.promocao} onChange={(e) => setField("promocao", e.target.checked)}
                      className="h-[1.8vh] w-[1.8vh]" style={{ accentColor: C.red1 }} />
                    <span className="text-[1.1vh] font-light" style={{ color: C.noir }}>Destaque</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-[0.8vh]">
                    <input type="checkbox" checked={form.ativo} onChange={(e) => setField("ativo", e.target.checked)}
                      className="h-[1.8vh] w-[1.8vh]" style={{ accentColor: C.red1 }} />
                    <span className="text-[1.1vh] font-light" style={{ color: C.noir }}>Ativo</span>
                  </label>
                </div>
              </section>

              {/* ── AÇÕES (RODAPÉ) ────────────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-[1.2vh] pt-[1.5vh] shrink-0" style={{ borderTop: `1px solid ${C.bege1}` }}>
                <button type="button" onClick={closeModal}
                  className="h-[4vh] px-[2.5vh] text-[1.1vh] font-medium tracking-[0.2em] uppercase rounded-sm border transition cursor-pointer"
                  style={{ borderColor: C.bege2, color: C.noir }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading || anyUploading}
                  className="h-[4vh] px-[2.5vh] text-[1.1vh] font-medium uppercase tracking-[0.2em] rounded-sm text-white transition disabled:opacity-40 cursor-pointer"
                  style={{ backgroundColor: C.red1 }}>
                  {formLoading ? "Salvando..." : editingProduct ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
