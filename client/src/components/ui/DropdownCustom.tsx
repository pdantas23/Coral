import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  color?: { bg: string; text: string };
}

interface DropdownCustomProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function DropdownCustom({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  disabled = false,
  size = "md",
}: DropdownCustomProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    // Use 'click' instead of 'mousedown' to allow option selection first
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-lg transition-all ${sizeClasses[size]} ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"
        }`}
        style={{
          backgroundColor: selected?.color?.bg ?? "rgba(38, 194, 185, 0.15)",
          color: selected?.color?.text ?? "#26C2B9",
          border: `1px solid rgba(38, 194, 185, 0.40)`,
        }}
      >
        <span className="font-medium uppercase tracking-wider">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu (Absolute Positioning) */}
      {open && !disabled && (
        <div
          className="absolute top-full left-0 w-full mt-2 rounded-lg shadow-2xl z-50 overflow-hidden border"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(38, 194, 185, 0.40)",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {options.map((option, idx) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full text-left px-3 py-3 transition-colors hover:bg-opacity-80 font-medium uppercase tracking-wider text-sm cursor-pointer"
              style={{
                backgroundColor: value === option.value ? "rgba(38, 194, 185, 0.20)" : "transparent",
                color: option.color?.text ?? "#26C2B9",
                borderBottom: idx === options.length - 1 ? "none" : "1px solid rgba(38, 194, 185, 0.15)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
