import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/features/auth/useAuth";
import { LogOut } from "lucide-react";

const C = {
  red1:   "#FD6E5E",
  noir:   "#333333",
  bege1:  "#EDE8E1",
  bege2:  "#DED6BF",
  bege3:  "#C8C1AC",
  owhite: "#FAF5ED",
  white:  "#FFFFFF",
} as const;

type DashboardLayoutProps = {
  children: ReactNode;
  navItems?: { label: string; href: string }[];
};

export default function DashboardLayout({
  children,
  navItems = [],
}: DashboardLayoutProps) {
  const { logout, profile } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.owhite, fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* Header */}
      <header style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.bege2}` }}>
        <div className="relative mx-auto flex w-full max-w-screen-xl items-center justify-center px-6 py-4 sm:px-8">

          {/* Brand (center - fixed position) */}
          <div className="flex flex-col leading-none items-center">
            <div className="h-8 w-8 md:h-12 md:w-12 shrink-0">
                <img
                  src="/logo.png"
                  alt="Coral Acessórios Logo"
                  className="h-full w-full object-contain"
                />
              </div>
          </div>

          {/* Nav tabs (center, desktop) - Hidden */}
          {navItems.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className="px-4 py-1.5 text-[10px] font-medium tracking-[0.3em] uppercase transition"
                    style={{
                      color: isActive ? C.noir : C.bege3,
                      borderBottom: isActive ? `2px solid ${C.red1}` : "2px solid transparent",
                      textDecoration: "none",
                    }}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Logout button */}
          <div className="absolute right-6 sm:right-8 flex items-center gap-4">
            <button type="button" onClick={logout}
              className="flex items-center gap-1.5 text-[10px] font-light tracking-[0.3em] uppercase transition hover:opacity-50"
              style={{ color: C.bege3, background: "none", border: "none", cursor: "pointer" }}>
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Nav tabs (mobile) */}
        {navItems.length > 0 && (
          <div className="flex gap-0 overflow-x-auto border-t sm:hidden" style={{ borderColor: C.bege2 }}>
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className="flex-1 whitespace-nowrap px-4 py-2.5 text-center text-[9px] font-medium tracking-[0.3em] uppercase transition"
                  style={{
                    color: isActive ? C.red1 : C.bege3,
                    borderBottom: isActive ? `2px solid ${C.red1}` : "2px solid transparent",
                    textDecoration: "none",
                  }}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
