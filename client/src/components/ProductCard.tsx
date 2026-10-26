import { motion } from "framer-motion";

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
  isFeatured?: boolean;
  onClick?: () => void;
}

export default function ProductCard({
  image,
  name,
  category,
  price,
  isFeatured = false,
  onClick,
}: ProductCardProps) {
  return (
    <motion.div
      className="flex flex-col h-full rounded-[32px] overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.bege1}`,
        boxShadow: `0 4px 16px rgba(253, 110, 94, 0.08)`,
        minHeight: "480px",
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
      <div className="flex flex-col gap-3 p-6 flex-1">
        {/* Category */}
        {category && (
          <p
            className="text-[9px] tracking-[0.1em] uppercase font-light"
            style={{ color: C.bege3 }}
          >
            {category}
          </p>
        )}

        {/* Product Name */}
        <p
          className="text-lg font-bold leading-snug line-clamp-2"
          style={{ color: C.noir }}
        >
          {name}
        </p>

        {/* Price */}
        <p
          className="text-base font-semibold"
          style={{ color: C.red1 }}
        >
          R$ {price.toFixed(2).replace(".", ",")}
        </p>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* CTA Button */}
        <motion.button
          className="w-full text-[10px] font-medium tracking-[0.28em] uppercase py-3 rounded-full transition-all duration-300"
          style={{
            background: C.red1,
            color: C.white,
            border: "none",
            cursor: "pointer",
          }}
          whileHover={{
            background: C.red2,
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
        >
          Ver Peça
        </motion.button>
      </div>
    </motion.div>
  );
}
