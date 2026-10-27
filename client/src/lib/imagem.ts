import type { SyntheticEvent } from "react";

/*
 * Fotos de produto em tamanho de exibição.
 *
 * As fotos do fornecedor ficam no Supabase Storage em até 1600 px (cerca de
 * 50 a 100 KB cada) e eram carregadas inteiras em cards de 200 a 300 px. Além
 * do download, o navegador decodifica cada uma em tamanho cheio (1067 x 1600
 * dá cerca de 7 MB de memória por foto), o que pesa na rolagem do Safari.
 *
 * O Storage self-hosted tem o redimensionamento ligado
 * (/storage/v1/render/image/public/...?width=), então o card pede só a
 * largura de que precisa, via srcset. Se a versão redimensionada falhar, o
 * onError volta para o arquivo original.
 */

const OBJETO = "/storage/v1/object/public/";
const RENDER = "/storage/v1/render/image/public/";

/** Larguras pedidas ao Storage (o navegador escolhe pelo `sizes` e pela densidade da tela). */
export const LARGURAS_CARD = [320, 480, 640, 960] as const;

export function urlRedimensionada(url: string, largura: number, qualidade = 80): string | null {
  if (!url.includes(OBJETO)) return null;
  const [base] = url.split("?");
  return `${base.replace(OBJETO, RENDER)}?width=${largura}&quality=${qualidade}`;
}

/**
 * Props de <img> com srcset para uma foto do Storage. Para URL de fora do
 * Storage, devolve só o src original.
 */
export function propsFoto(
  url: string,
  sizes: string,
  larguras: readonly number[] = LARGURAS_CARD,
): { src: string; srcSet?: string; sizes?: string; onError?: (e: SyntheticEvent<HTMLImageElement>) => void } {
  if (!urlRedimensionada(url, larguras[0])) return { src: url };
  const srcSet = larguras.map((w) => `${urlRedimensionada(url, w)} ${w}w`).join(", ");
  return {
    src: urlRedimensionada(url, larguras[larguras.length - 1])!,
    srcSet,
    sizes,
    onError: (e) => {
      const img = e.currentTarget;
      if (img.dataset.original) return;
      img.dataset.original = "1";
      img.removeAttribute("srcset");
      img.src = url;
    },
  };
}
