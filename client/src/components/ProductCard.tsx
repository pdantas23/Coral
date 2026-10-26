import { motion } from "framer-motion";
import { formatarPreco } from "@/features/catalog/variantUtils";
import { FOCO_CARD, propsCardClicavel } from "@/lib/cardClicavel";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  red1:   "#FD6E5E",
  red2:   "#CC4834",
  noir:   "#333333",
  bege1:  "#EDE8E1",
  bege2:  "#DED6BF",
  bege3:  "#C8C1AC",
  white:  "#FFFFFF",
} as const;

interface ProductCardProps {
  image: string;
  name: string;
  category: string;
  price: number;
  /** true quando as variações têm preços diferentes: mostra "a partir de" */
  priceFrom?: boolean;
  brand?: string | null;
  isFeatured?: boolean;
  onClick?: () => void;
}

export default function ProductCard({
  image,
  name,
  category,
  price,
  priceFrom = false,
  brand,
  isFeatured = false,
  onClick,
}: ProductCardProps) {
  // O card inteiro é um botão: clicar em qualquer ponto (ou Enter/Espaço
  // com o foco nele) abre o produto. O "Ver peça" é só indicação visual.
  return (
    <motion.div
      {...propsCardClicavel(() => onClick?.(), `Ver ${name}`)}
      data-testid="highlight-card"
      className={`group flex w-full flex-col h-full rounded-[32px] overflow-hidden text-left cursor-pointer ${FOCO_CARD}`}
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.bege1}`,
        boxShadow: `0 4px 16px rgba(253, 110, 94, 0.08)`,
      }}
      whileHover={{
        y: -10,
        boxShadow: `0 20px 40px rgba(253, 110, 94, 0.15)`,
      }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {/* Image Container */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "3/4" }}
        whileHover="hover"
        initial="normal"
      >
        {image ? (
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            variants={{
              normal: { scale: 1 },
              hover: { scale: 1.05 },
            }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: C.bege1 }}
          >
            <span
              className="text-[10px] tracking-widest uppercase"
              style={{ color: C.bege3 }}
            >
              Peça
            </span>
          </div>
        )}

        {/* Badge "Destaque" */}
        {isFeatured && (
          <motion.div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[9px] tracking-widest uppercase font-medium"
            style={{
              background: C.red1,
              color: C.white,
              boxShadow: `0 4px 12px rgba(253, 110, 94, 0.30)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            Destaque
          </motion.div>
        )}
      </motion.div>

      {/* Content Area */}
      <div className="flex flex-col gap-2.5 p-5 xl:p-6 2xl:gap-3 2xl:p-7 flex-1">
        {/* Marca e categoria */}
        {(brand || category) && (
          <p
            className="text-[9px] 2xl:text-[10px] tracking-[0.12em] uppercase font-light truncate"
            style={{ color: "#8A8270" }}
          >
            {[brand, category].filter(Boolean).join("  ·  ")}
          </p>
        )}

        {/* Product Name */}
        <p
          className="text-base xl:text-lg 2xl:text-xl font-bold leading-snug line-clamp-2"
          style={{ color: C.noir }}
        >
          {name}
        </p>

        {/* Price */}
        <p
          className="text-sm xl:text-base 2xl:text-lg font-semibold"
          style={{ color: C.red1 }}
        >
          {priceFrom && (
            <span className="mr-1 text-[10px] 2xl:text-xs font-light" style={{ color: "#8A8270" }}>a partir de</span>
          )}
          {formatarPreco(price)}
        </p>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* CTA Button */}
        <span
          aria-hidden="true"
          className="block w-full text-center text-[10px] 2xl:text-[11px] font-medium tracking-[0.28em] uppercase py-3 2xl:py-3.5 rounded-full bg-[#FD6E5E] text-white transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-[#CC4834] motion-reduce:transition-none"
        >
          Ver Peça
        </span>
      </div>
    </motion.div>
  );
}
