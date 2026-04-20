import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { useEffect, useState } from "react";

const COLORS = {
  BG: "#FFFFFF",
  TEAL: "#26C2B9",
};

export default function SplashScreen() {
  const { isLoading } = useGlobalLoading();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);
    }
  }, [isLoading]);

  // Desabilitar scroll enquanto loading
  useEffect(() => {
    if (isLoading || fadeOut) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isLoading, fadeOut]);

  if (!isLoading && !fadeOut) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[999] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: COLORS.BG }}
      onTransitionEnd={() => {
        if (fadeOut) {
          document.documentElement.style.overflow = "";
        }
      }}
    >
      {/* Center Container */}
      <div className="flex flex-col items-center gap-8">
        {/* Logo with Pulse Animation */}
        <div className="relative">
          <style>{`
            @keyframes pulse-gentle {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.7;
              }
            }

            .logo-pulse {
              animation: pulse-gentle 2s ease-in-out infinite;
            }
          `}</style>

          <img
            src="/icon.png"
            alt="Forma Eventos"
            className="logo-pulse w-48 h-20 object-contain"
          />
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              backgroundColor: COLORS.TEAL,
              width: isLoading ? "65%" : "100%",
            }}
          />
        </div>

        {/* Loading Text */}
        <p
          className="text-xs font-light tracking-wider uppercase"
          style={{ color: COLORS.TEAL }}
        >
          Carregando plataforma...
        </p>
      </div>
    </div>
  );
}
