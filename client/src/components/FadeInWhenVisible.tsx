import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Atraso antes de iniciar (segundos) */
  delay?: number;
  /** Duração da transição (segundos) */
  duration?: number;
  /** Deslocamento vertical inicial em px */
  y?: number;
  /** Classe CSS adicional no wrapper */
  className?: string;
  /**
   * Margem de ativação relativa ao viewport.
   * Negativo = inicia antes do elemento entrar totalmente na tela.
   */
  margin?: string;
}

/**
 * Wrapper de Scroll Reveal para Quiet Luxury.
 * Usa whileInView + once:true para disparar UMA vez ao entrar no viewport.
 * Easing [0.22,1,0.36,1] — aceleração rápida, desaceleração imperceptível.
 */
export default function FadeInWhenVisible({
  children,
  delay    = 0,
  duration = 1.0,
  y        = 20,
  className,
  margin   = "-100px",
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
