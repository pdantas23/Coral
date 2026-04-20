// ─── Circular Testimonials — com swipe, setas laterais contextuais e dots ─────
// Gestos: framer-motion drag="x" · Setas: fade após primeiro swipe · Dots: centrados

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export interface TestimonialItem {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

interface CircularTestimonialsProps {
  testimonials: TestimonialItem[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}

function calculateGap(width: number): number {
  const minGap = 32, maxGap = 52;
  const t = Math.min(1, Math.max(0, (width - 320) / 320));
  return minGap + (maxGap - minGap) * t;
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) {
  const colorName       = colors.name             ?? "#000000";
  const colorDesig      = colors.designation      ?? "#6b7280";
  const colorTestimony  = colors.testimony        ?? "#4b5563";
  const colorArrowBg    = colors.arrowBackground  ?? "#141414";
  const colorArrowFg    = colors.arrowForeground  ?? "#f1f1f7";
  const colorArrowHover = colors.arrowHoverBackground ?? "#00a6fb";

  const fontName  = fontSizes.name        ?? "1.35rem";
  const fontDesig = fontSizes.designation ?? "0.80rem";
  const fontQuote = fontSizes.quote       ?? "0.95rem";

  const [activeIndex,    setActiveIndex]    = useState(0);
  const [containerWidth, setContainerWidth] = useState(320);
  const [isDragging,     setIsDragging]     = useState(false);
  const [liveOffset,     setLiveOffset]     = useState(0);
  // Setas só aparecem após o primeiro gesto de arraste
  const [arrowsVisible,  setArrowsVisible]  = useState(false);
  const [hoverPrev,      setHoverPrev]      = useState(false);
  const [hoverNext,      setHoverNext]      = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const len    = useMemo(() => testimonials.length, [testimonials]);
  const active = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials]);

  // Mede largura via ResizeObserver
  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    timerRef.current = setInterval(() => setActiveIndex(p => (p + 1) % len), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplay, len]);

  // Teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, len]);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const handleNext = useCallback(() => {
    clearTimer();
    setActiveIndex(p => (p + 1) % len);
  }, [len]);

  const handlePrev = useCallback(() => {
    clearTimer();
    setActiveIndex(p => (p - 1 + len) % len);
  }, [len]);

  // ── Calcula o estilo 3D de cada imagem ────────────────────────────────────────
  // Durante o arraste, o card ativo inclina-se e desloca levemente (live 3D)
  function getImageStyle(index: number): React.CSSProperties {
    const gap     = calculateGap(containerWidth);
    const stickUp = gap * 0.72;

    const isActive = index === activeIndex;
    const isLeft   = (activeIndex - 1 + len) % len === index;
    const isRight  = (activeIndex + 1)        % len === index;

    const base: React.CSSProperties = {
      position: "absolute",
      top: 0, left: 0,
      width: "100%", height: "100%",
      objectFit: "cover",
      borderRadius: "1.25rem",
      boxShadow: "0 14px 40px rgba(0,0,0,0.50)",
      userSelect: "none",
    };

    if (isActive) {
      // Live 3D durante arraste: inclinação sutil + drift leve
      const tilt  = isDragging ? -liveOffset * 0.022 : 0;
      const drift = isDragging ?  liveOffset * 0.055 : 0;
      return {
        ...base,
        zIndex: 3,
        opacity: 1,
        pointerEvents: "none",
        transform: `translateX(${drift}px) translateY(0) scale(1) rotateY(${tilt}deg)`,
        transition: isDragging
          ? "none"
          : "all 0.72s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) return {
      ...base, zIndex: 2, opacity: 1, pointerEvents: "none",
      transform: `translateX(-${gap}px) translateY(-${stickUp}px) scale(0.82) rotateY(14deg)`,
      transition: "all 0.72s cubic-bezier(.4,2,.3,1)",
    };
    if (isRight) return {
      ...base, zIndex: 2, opacity: 1, pointerEvents: "none",
      transform: `translateX(${gap}px) translateY(-${stickUp}px) scale(0.82) rotateY(-14deg)`,
      transition: "all 0.72s cubic-bezier(.4,2,.3,1)",
    };
    return { ...base, zIndex: 1, opacity: 0, pointerEvents: "none",
      transition: "all 0.72s cubic-bezier(.4,2,.3,1)" };
  }

  // ── Estilo das setas laterais — minimalistas, sem fundo ──────────────────────
  const arrowStyle = (side: "left" | "right", hovered: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    [side]: "8px",
    transform: "translateY(-50%)",
    zIndex: 20,
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    opacity: hovered ? 1 : 0.55,
    pointerEvents: "auto",
  });

  const quoteVariants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0  },
    exit:    { opacity: 0, y: -14 },
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>

      {/* ── Imagens em perspectiva 3D ─────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "280px",
          perspective: "900px",
          marginBottom: "28px",
        }}
      >
        {/* Cards de imagem */}
        {testimonials.map((t, i) => (
          <img
            key={t.src}
            src={t.src}
            alt={t.name}
            draggable={false}
            style={getImageStyle(i)}
          />
        ))}

        {/* Overlay de drag — captura gestos horizontais */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            touchAction: "pan-y",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={() => {
            setIsDragging(true);
            setArrowsVisible(true);
            clearTimer();
          }}
          onDrag={(_, info) => setLiveOffset(info.offset.x)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            setLiveOffset(0);
            const { offset, velocity } = info;
            if (offset.x > 50 || velocity.x > 350)       handlePrev();
            else if (offset.x < -50 || velocity.x < -350) handleNext();
          }}
        />

        {/* Seta Esquerda — fade in após primeiro swipe */}
        <motion.button
          aria-label="Anterior"
          initial={{ opacity: 0 }}
          animate={{ opacity: arrowsVisible ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          onClick={handlePrev}
          onMouseEnter={() => setHoverPrev(true)}
          onMouseLeave={() => setHoverPrev(false)}
          style={arrowStyle("left", hoverPrev)}
        >
          <FaChevronLeft size={13} color="rgba(255,255,255,0.90)" />
        </motion.button>

        {/* Seta Direita */}
        <motion.button
          aria-label="Próximo"
          initial={{ opacity: 0 }}
          animate={{ opacity: arrowsVisible ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleNext}
          onMouseEnter={() => setHoverNext(true)}
          onMouseLeave={() => setHoverNext(false)}
          style={arrowStyle("right", hoverNext)}
        >
          <FaChevronRight size={13} color="rgba(255,255,255,0.90)" />
        </motion.button>
      </div>

      {/* ── Conteúdo textual ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          variants={quoteVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.26, ease: "easeInOut" }}
          style={{ minHeight: "130px" }}
        >
          <h3 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: fontName,
            fontWeight: 700,
            color: colorName,
            margin: "0 0 4px",
          }}>
            {active.name}
          </h3>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: fontDesig,
            fontWeight: 500,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: colorDesig,
            margin: "0 0 14px",
          }}>
            {active.designation}
          </p>

          <motion.p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: fontQuote,
            fontWeight: 300,
            lineHeight: 1.82,
            color: colorTestimony,
            margin: 0,
          }}>
            {active.quote.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ filter: "blur(7px)", opacity: 0, y: 3 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut", delay: 0.018 * i }}
                style={{ display: "inline-block" }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* ── Dots centralizados ────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "7px",
        paddingTop: "22px",
      }}>
        {testimonials.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => { setActiveIndex(i); clearTimer(); }}
            aria-label={`Item ${i + 1}`}
            animate={{
              width: i === activeIndex ? "22px" : "7px",
              backgroundColor: i === activeIndex ? "rgb(191, 161, 111)" : "rgba(255,255,255,0.22)",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              height: "7px",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

    </div>
  );
}

export default CircularTestimonials;
