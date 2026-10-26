/**
 * Número de WhatsApp da Coral. Vem de VITE_WHATSAPP_NUMBER (como o site já
 * fazia); o valor de reserva é o mesmo que está no site publicado hoje.
 */
const NUMERO_RESERVA = "5586988660008";

export function numeroWhatsApp(): string {
  const env = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "";
  return (env || NUMERO_RESERVA).replace(/\D/g, "");
}

export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(mensagem)}`;
}
