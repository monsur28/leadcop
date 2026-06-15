export const APP_CONFIG = {
  name: "LeadCop",
  description: "Advanced disposable and role-based email validation engine.",
  supportEmail: "support@leadcop.com",
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;
