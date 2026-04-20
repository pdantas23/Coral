import type { AppRole } from "@/features/auth/authTypes";

const ROLE_DEFAULT_ROUTES: Record<AppRole, string> = {
  comercial: "/comercial",
  marketing: "/marketing",
};

export function getDefaultRouteByRole(role: AppRole | null | undefined): string {
  if (!role) return "/";
  return ROLE_DEFAULT_ROUTES[role] ?? "/";
}
