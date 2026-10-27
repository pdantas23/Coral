import { describe, expect, it } from "vitest";
import { propsFoto, urlRedimensionada } from "./imagem";

const ORIG = "https://sb.rcoacademy.com.br/storage/v1/object/public/images-coral/produtos/1-a.webp";

describe("urlRedimensionada", () => {
  it("troca object por render e pede a largura", () => {
    expect(urlRedimensionada(ORIG, 480)).toBe(
      "https://sb.rcoacademy.com.br/storage/v1/render/image/public/images-coral/produtos/1-a.webp?width=480&quality=80",
    );
  });
  it("descarta a query antiga", () => {
    expect(urlRedimensionada(`${ORIG}?t=1`, 320)).toContain("1-a.webp?width=320&");
  });
  it("não mexe em URL de fora do Storage", () => {
    expect(urlRedimensionada("https://images.unsplash.com/x.jpg", 320)).toBeNull();
  });
});

describe("propsFoto", () => {
  it("monta srcset com as larguras e o sizes", () => {
    const p = propsFoto(ORIG, "25vw", [320, 640]);
    expect(p.srcSet).toBe(`${urlRedimensionada(ORIG, 320)} 320w, ${urlRedimensionada(ORIG, 640)} 640w`);
    expect(p.sizes).toBe("25vw");
    expect(p.src).toBe(urlRedimensionada(ORIG, 640));
    expect(p.onError).toBeTypeOf("function");
  });
  it("URL externa fica como está, sem srcset", () => {
    expect(propsFoto("/x.png", "25vw")).toEqual({ src: "/x.png" });
  });
});
