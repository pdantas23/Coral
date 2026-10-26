/**
 * slugify: tira acentos, põe em minúsculas e troca tudo que não for
 * [a-z0-9] por hífen. Usado pela API (slug do produto) e pelo script de
 * importação, para os dois gerarem o mesmo slug.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
