import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const TOAST_ICONS: Record<ToastType, { Icon: typeof CheckCircle; color: string; bg: string }> = {
  success: {
    Icon: CheckCircle,
    color: "#4CAF50",
    bg: "rgba(76, 175, 80, 0.15)",
  },
  error: {
    Icon: AlertCircle,
    color: "#F44336",
    bg: "rgba(244, 67, 54, 0.15)",
  },
  warning: {
    Icon: AlertTriangle,
    color: "rgb(191, 161, 111)",
    bg: "rgba(191, 161, 111, 0.15)",
  },
  info: {
    Icon: Info,
    color: "#26C2B9",
    bg: "rgba(38, 194, 185, 0.15)",
  },
};

export default function Toast({ id, type, title, message, duration = 4000, onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { Icon, color, bg } = TOAST_ICONS[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => onClose(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 max-w-sm ${
        isClosing ? "opacity-0 translate-x-96" : "opacity-100 translate-x-0"
      }`}
      style={{
        backgroundColor: bg,
        borderColor: color,
        borderWidth: "1px",
      }}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>
          {title}
        </p>
        {message && (
          <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          setIsClosing(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="text-xs font-medium flex-shrink-0 transition hover:opacity-60"
        style={{ color: "rgba(255, 255, 255, 0.5)" }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
