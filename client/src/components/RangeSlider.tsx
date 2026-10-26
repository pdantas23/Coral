import { useState, useRef, useEffect } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
}

export default function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

  const colors = {
    red1: "#FD6E5E",
    bege1: "#EDE8E1",
    white: "#FFFFFF",
  };

  function getPercentage(value: number) {
    return ((value - min) / (max - min)) * 100;
  }

  function updateValue(clientX: number, type: "min" | "max") {
    if (!trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - trackRect.left) / trackRect.width));
    const newValue = Math.round((percentage * (max - min) + min) / step) * step;
    const clampedValue = Math.max(min, Math.min(max, newValue));

    if (type === "min") {
      onChangeMin(Math.min(clampedValue, valueMax));
    } else {
      onChangeMax(Math.max(clampedValue, valueMin));
    }
  }

  function handleMouseDown(type: "min" | "max") {
    if (type === "min") setIsDraggingMin(true);
    else setIsDraggingMax(true);
  }

  function handleTouchStart(type: "min" | "max") {
    if (type === "min") setIsDraggingMin(true);
    else setIsDraggingMax(true);
  }

  function handleMouseMove(e: MouseEvent) {
    if (isDraggingMin || isDraggingMax) {
      updateValue(e.clientX, isDraggingMin ? "min" : "max");
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (isDraggingMin || isDraggingMax) {
      e.preventDefault();
      const touch = e.touches[0];
      updateValue(touch.clientX, isDraggingMin ? "min" : "max");
    }
  }

  function handleEnd() {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  }

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDraggingMin, isDraggingMax, valueMin, valueMax, min, max, step]);

  const minPercentage = getPercentage(valueMin);
  const maxPercentage = getPercentage(valueMax);

  return (
    <div className="w-full" style={{ touchAction: "none" }}>
      {/* Display values */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-light" style={{ color: "#333333" }}>
          R$ {Math.round(valueMin).toLocaleString("pt-BR")}
        </span>
        <span className="text-xs font-light" style={{ color: "#333333" }}>
          R$ {Math.round(valueMax).toLocaleString("pt-BR")}
        </span>
      </div>

      {/* Track container */}
      <div
        ref={trackRef}
        className="relative h-2 rounded-full cursor-pointer"
        style={{ background: colors.bege1 }}
      >
        {/* Range highlight */}
        <div
          className="absolute h-2 rounded-full pointer-events-none"
          style={{
            background: colors.red1,
            left: `${minPercentage}%`,
            right: `${100 - maxPercentage}%`,
            top: "0",
          }}
        />

        {/* Min thumb */}
        <div
          onMouseDown={() => handleMouseDown("min")}
          onTouchStart={() => handleTouchStart("min")}
          className="absolute rounded-full cursor-grab active:cursor-grabbing transition-shadow"
          style={{
            background: colors.white,
            border: `2px solid ${colors.red1}`,
            width: "24px",
            height: "24px",
            left: `${minPercentage}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: isDraggingMin ? `0 4px 12px rgba(253, 110, 94, 0.3)` : "0 2px 6px rgba(0,0,0,0.08)",
            zIndex: isDraggingMin ? 10 : 5,
          }}
        />

        {/* Max thumb */}
        <div
          onMouseDown={() => handleMouseDown("max")}
          onTouchStart={() => handleTouchStart("max")}
          className="absolute rounded-full cursor-grab active:cursor-grabbing transition-shadow"
          style={{
            background: colors.white,
            border: `2px solid ${colors.red1}`,
            width: "24px",
            height: "24px",
            left: `${maxPercentage}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: isDraggingMax ? `0 4px 12px rgba(253, 110, 94, 0.3)` : "0 2px 6px rgba(0,0,0,0.08)",
            zIndex: isDraggingMax ? 10 : 5,
          }}
        />
      </div>
    </div>
  );
}
