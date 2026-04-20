import LeadCapturaSection from "@/components/LeadCapturaSection";
import Navbar from "@/components/Navbar";
import FadeInWhenVisible from "@/components/FadeInWhenVisible";

const LINEN    = "#F4F1EE";
const CHARCOAL = "#2A2A2A";

export default function EventosExclusivos() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: LINEN, color: CHARCOAL }}
    >
      <Navbar theme="light" />

      <LeadCapturaSection />

      <footer
        className="py-14 text-center"
        style={{ backgroundColor: "#111", borderTop: "1px solid rgba(197,160,89,0.08)" }}
      >
        <FadeInWhenVisible duration={0.8} y={10} margin="-40px">
          <p
            className="font-inter font-light uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.5em", color: "rgba(255,255,255,0.25)" }}
          >
            © 2026 Forma Eventos
          </p>
        </FadeInWhenVisible>
      </footer>
    </div>
  );
}
