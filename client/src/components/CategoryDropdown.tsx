import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function CategoryDropdown({
  value,
  onChange,
  options,
  placeholder = "Selecionar",
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const colors = {
    red1: "#FD6E5E",
    noir: "#333333",
    bege1: "#EDE8E1",
    bege2: "#DED6BF",
    bege3: "#C8C1AC",
    owhite: "#FAF5ED",
    pink1: "#FEEDED",
    white: "#FFFFFF",
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    function updateMenuPosition() {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }

    if (isOpen) {
      updateMenuPosition();
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);
      return () => {
        window.removeEventListener("resize", updateMenuPosition);
        window.removeEventListener("scroll", updateMenuPosition, true);
      };
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full h-[36px] px-3 text-xs font-light outline-none rounded-sm flex items-center justify-between transition"
        style={{
          border: `1px solid ${isOpen ? colors.red1 : colors.bege2}`,
          background: colors.owhite,
          color: value ? colors.noir : colors.bege3,
          cursor: "pointer",
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className="h-3 w-3 transition-transform"
          style={{
            color: colors.bege3,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && menuPosition && createPortal(
        <div
          className="rounded-md overflow-hidden shadow-lg"
          style={{
            position: "absolute",
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            zIndex: 9999,
            background: colors.white,
            border: `1px solid ${colors.bege2}`,
            boxShadow: "0 8px 24px rgba(51,51,51,0.12)",
          }}
        >
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs font-light transition"
                style={{
                  background: value === option.value ? colors.pink1 : "transparent",
                  color: value === option.value ? colors.noir : colors.bege3,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = colors.pink1;
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      , document.body)}
    </div>
  );
}
