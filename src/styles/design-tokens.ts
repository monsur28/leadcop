export const COLORS = {
  // Brand — LeadCop Orange
  primary: "#FF7A00",
  primaryLight: "#FF9F43",
  primaryDark: "#E66E00",
  primaryGhost: "rgba(255,122,0,0.08)",
  primaryGlow: "rgba(255,122,0,0.20)",

  // Neutrals
  navy: "#0a0a0a",
  navyLight: "#171717",

  // Semantic
  success: "#10B981",
  successGhost: "rgba(16,185,129,0.10)",
  warning: "#F59E0B",
  warningGhost: "rgba(245,158,11,0.10)",
  danger: "#EF4444",
  dangerGhost: "rgba(239,68,68,0.10)",
  info: "#3B82F6",
  infoGhost: "rgba(59,130,246,0.10)",

  // Surface
  background: "#FAFAFA",
  card: "#FFFFFF",
  border: "#E5E5E5",
  borderSubtle: "#F0F0F0",

  // Text
  textPrimary: "#171717",
  textSecondary: "#737373",
  textMuted: "#A3A3A3",
};

export const TYPOGRAPHY = {
  fontFamily: "'Inter', system-ui, sans-serif",
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    headingXl: "2.25rem", // 36px
    headingLg: "1.875rem", // 30px
    headingMd: "1.5rem", // 24px
    bodyLg: "1.125rem", // 18px
    bodyMd: "1rem", // 16px
    bodySm: "0.875rem", // 14px
    caption: "0.75rem", // 12px
  },
};

export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

export const RADII = {
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
};

export const SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

export const TOKENS = {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADII,
  SHADOWS,
};
