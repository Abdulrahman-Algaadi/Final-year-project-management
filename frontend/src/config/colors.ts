/** Aden University brand palette — shared by UI tokens and PDF exports */
export const C = {
  primary: "1B3A2D",
  primaryLight: "2D6A4F",
  accent: "D4A843",
  accentLight: "F0D68A",
  dark: "0F1A14",
  text: "1A1A1A",
  white: "FFFFFF",
  muted: "6B7280",
  light: "F5F3EF",
  card: "FFFFFF",
  border: "E5E1D8",
  success: "059669",
  warning: "D97706",
  danger: "DC2626",
  primaryRGB: [27, 58, 45] as const,
  primaryLightRGB: [45, 106, 79] as const,
  accentRGB: [212, 168, 67] as const,
  accentLightRGB: [240, 214, 138] as const,
  textRGB: [26, 26, 26] as const,
  mutedRGB: [107, 114, 128] as const,
  borderRGB: [229, 225, 216] as const,
  lightRGB: [245, 243, 239] as const,
  whiteRGB: [255, 255, 255] as const,
} as const;

/** Computed / derivative tokens used across UI surfaces */
export const DERIVATIVES = {
  heroGradientMid: C.primary,
  radialGlowGold: "rgba(212, 168, 67, 0.12)",
  radialGlowGreen: "rgba(45, 106, 79, 0.2)",
  featureBadgeBg: "F0EFEA",
  problemBoxBg: "FEF9E7",
  problemBoxBorder: C.accent,
  errorCardBg: "FEE2E2",
  errorText: "991B1B",
  successCardBg: "EBF5F0",
  successText: "065F46",
  infoCardBg: "F0F9FF",
  infoText: "0C4A6E",
  toastSuccessBg: "ECFDF5",
  toastSuccessBorder: "A7F3D0",
  toastErrorBg: "FEF2F2",
  toastErrorBorder: "FECACA",
  toastInfoBg: "F0F9FF",
  toastInfoBorder: "BAE6FD",
  subtleGreen: "223D31",
  mutedGreenText: "8FA89E",
  placeholderGray: "F0F0F0",
  disabledOverlay: "rgba(255, 255, 255, 0.3)",
  whiteLowOpacity: "rgba(255, 255, 255, 0.6)",
  whiteLowOpacity2: "rgba(255, 255, 255, 0.8)",
  navShadow: "rgba(27, 58, 45, 0.25)",
  cardHoverShadow: "rgba(27, 58, 45, 0.1)",
} as const;

export function hexToHslChannels(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Build CSS custom-property map from hex tokens (for programmatic use). */
export function brandCssVars(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, hex] of Object.entries(C)) {
    if (typeof hex === "string" && /^[0-9A-Fa-f]{6}$/.test(hex)) {
      entries[`--brand-${key}`] = `#${hex}`;
    }
  }
  for (const [key, value] of Object.entries(DERIVATIVES)) {
    entries[`--brand-${key}`] = value.startsWith("rgba") || value.startsWith("#")
      ? value
      : `#${value}`;
  }
  return entries;
}
