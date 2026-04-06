import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeColor = {
  name: string;
  label: string;
  primary: string;       // e.g. #3B82F6
  primaryLight: string;  // Light bg tint
  primaryLighter: string;
  primaryDark: string;
  ring: string;
  gradient: string;
};

// Hex → RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// RGB → Hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

// Blend a color with white/black
function blend(hex: string, ratio: number, toWhite = true): string {
  const [r, g, b] = hexToRgb(hex);
  const target = toWhite ? 255 : 0;
  return rgbToHex(r + (target - r) * ratio, g + (target - g) * ratio, b + (target - b) * ratio);
}

// Derive theme shades from a single hex color
function deriveTheme(hex: string, name = "custom", label = "Custom"): ThemeColor {
  return {
    name,
    label,
    primary: hex,
    primaryLight: blend(hex, 0.92),
    primaryLighter: blend(hex, 0.85),
    primaryDark: blend(hex, 0.3, false),
    ring: blend(hex, 0.75),
    gradient: `from-[${hex}] to-[${blend(hex, 0.2, false)}]`,
  };
}

// Inject a <style> that overrides all relevant Tailwind blue utilities
// so every hardcoded blue-* class in every page becomes the chosen color
function injectThemeOverride(primary: string, primaryLight: string, primaryLighter: string, primaryDark: string, ring: string) {
  const existingStyle = document.getElementById("hv-theme-override");
  if (existingStyle) existingStyle.remove();

  const [r, g, b] = hexToRgb(primary);
  const [lr, lg, lb] = hexToRgb(primaryLight);
  const [llr, llg, llb] = hexToRgb(primaryLighter);
  const [dr, dg, db] = hexToRgb(primaryDark);
  const [rr, rg, rb] = hexToRgb(ring);

  const style = document.createElement("style");
  style.id = "hv-theme-override";
  style.textContent = `
    /* ── Background overrides ── */
    .bg-blue-50  { background-color: rgb(${lr},${lg},${lb}) !important; }
    .bg-blue-100 { background-color: rgb(${llr},${llg},${llb}) !important; }
    .bg-blue-400 { background-color: rgb(${r},${g},${b},0.7) !important; }
    .bg-blue-500 { background-color: rgb(${r},${g},${b}) !important; }
    .bg-blue-600 { background-color: rgb(${dr},${dg},${db}) !important; }
    .bg-blue-700 { background-color: rgb(${Math.round(dr*0.85)},${Math.round(dg*0.85)},${Math.round(db*0.85)}) !important; }

    /* ── Text overrides ── */
    .text-blue-400 { color: rgb(${r},${g},${b},0.7) !important; }
    .text-blue-500 { color: rgb(${r},${g},${b}) !important; }
    .text-blue-600 { color: rgb(${dr},${dg},${db}) !important; }
    .text-blue-700 { color: rgb(${Math.round(dr*0.85)},${Math.round(dg*0.85)},${Math.round(db*0.85)}) !important; }

    /* ── Border overrides ── */
    .border-blue-100 { border-color: rgb(${llr},${llg},${llb}) !important; }
    .border-blue-200 { border-color: rgb(${rr},${rg},${rb}) !important; }
    .border-blue-300 { border-color: rgb(${rr},${rg},${rb}) !important; }

    /* ── Ring overrides ── */
    .ring-blue-100 { --tw-ring-color: rgb(${llr},${llg},${llb}) !important; }
    .ring-blue-300 { --tw-ring-color: rgb(${rr},${rg},${rb}) !important; }

    /* ── Focus ring overrides ── */
    .focus\\:ring-blue-300:focus { --tw-ring-color: rgb(${rr},${rg},${rb}) !important; }
    .focus\\:border-blue-300:focus { border-color: rgb(${rr},${rg},${rb}) !important; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgb(${rr},${rg},${rb}) !important; }

    /* ── Hover overrides ── */
    .hover\\:bg-blue-50:hover  { background-color: rgb(${lr},${lg},${lb}) !important; }
    .hover\\:bg-blue-100:hover { background-color: rgb(${llr},${llg},${llb}) !important; }
    .hover\\:bg-blue-700:hover { background-color: rgb(${Math.round(dr*0.85)},${Math.round(dg*0.85)},${Math.round(db*0.85)}) !important; }
    .hover\\:text-blue-700:hover { color: rgb(${Math.round(dr*0.85)},${Math.round(dg*0.85)},${Math.round(db*0.85)}) !important; }
    .hover\\:border-blue-100:hover { border-color: rgb(${llr},${llg},${llb}) !important; }

    /* ── Gradient overrides ── */
    .from-blue-500 { --tw-gradient-from: rgb(${r},${g},${b}) !important; }
    .to-blue-600   { --tw-gradient-to: rgb(${dr},${dg},${db}) !important; }
    .from-blue-400 { --tw-gradient-from: rgba(${r},${g},${b},0.7) !important; }
    .to-blue-500   { --tw-gradient-to: rgb(${r},${g},${b}) !important; }

    /* ── Shadow overrides ── */
    .shadow-blue-200 { --tw-shadow-color: rgb(${rr},${rg},${rb}) !important; }

    /* ── Indigo overrides (some pages use indigo) ── */
    .from-indigo-500 { --tw-gradient-from: rgb(${r},${g},${b}) !important; }
    .to-indigo-500   { --tw-gradient-to: rgb(${dr},${dg},${db}) !important; }
    .bg-indigo-50    { background-color: rgb(${lr},${lg},${lb}) !important; }
    .text-indigo-600 { color: rgb(${dr},${dg},${db}) !important; }
    .border-indigo-200 { border-color: rgb(${rr},${rg},${rb}) !important; }
  `;
  document.head.appendChild(style);
}

export const THEME_COLORS: ThemeColor[] = [
  deriveTheme("#3B82F6", "blue", "Ocean Blue"),
  deriveTheme("#10B981", "emerald", "Emerald Green"),
  deriveTheme("#8B5CF6", "violet", "Violet Purple"),
  deriveTheme("#F43F5E", "rose", "Rose Pink"),
  deriveTheme("#F59E0B", "amber", "Amber Orange"),
  deriveTheme("#14B8A6", "teal", "Teal Cyan"),
  deriveTheme("#6366F1", "indigo", "Deep Indigo"),
];

type ThemeContextType = {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  setCustomColor: (hex: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeColor: THEME_COLORS[0],
  setThemeColor: () => {},
  setCustomColor: () => {},
  darkMode: false,
  toggleDarkMode: () => {},
});

function applyThemeCssVars(color: ThemeColor, dark: boolean) {
  const root = document.documentElement;
  root.style.setProperty("--hv-primary", color.primary);
  root.style.setProperty("--hv-primary-light", color.primaryLight);
  root.style.setProperty("--hv-primary-lighter", color.primaryLighter);
  root.style.setProperty("--hv-primary-dark", color.primaryDark);
  root.style.setProperty("--hv-ring", color.ring);

  if (dark) {
    root.classList.add("dark");
    root.style.setProperty("--hv-bg", "#0F172A");
    root.style.setProperty("--hv-surface", "#1E293B");
    root.style.setProperty("--hv-surface-2", "#334155");
    root.style.setProperty("--hv-border", "#334155");
    root.style.setProperty("--hv-text", "#F1F5F9");
    root.style.setProperty("--hv-text-muted", "#94A3B8");
  } else {
    root.classList.remove("dark");
    root.style.setProperty("--hv-bg", "#F0F4F8");
    root.style.setProperty("--hv-surface", "#FFFFFF");
    root.style.setProperty("--hv-surface-2", "#F8FAFC");
    root.style.setProperty("--hv-border", "#E2E8F0");
    root.style.setProperty("--hv-text", "#0F172A");
    root.style.setProperty("--hv-text-muted", "#64748B");
  }

  injectThemeOverride(color.primary, color.primaryLight, color.primaryLighter, color.primaryDark, color.ring);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    const savedName = localStorage.getItem("hv_theme_color");
    const savedCustom = localStorage.getItem("hv_theme_custom");
    if (savedCustom) return deriveTheme(savedCustom, "custom", "Custom");
    return THEME_COLORS.find((c) => c.name === savedName) || THEME_COLORS[0];
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("hv_dark_mode") === "true";
  });

  useEffect(() => {
    applyThemeCssVars(themeColor, darkMode);
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    localStorage.removeItem("hv_theme_custom");
    localStorage.setItem("hv_theme_color", color.name);
    setThemeColorState(color);
    applyThemeCssVars(color, darkMode);
  };

  const setCustomColor = (hex: string) => {
    const color = deriveTheme(hex, "custom", "Custom");
    localStorage.setItem("hv_theme_custom", hex);
    localStorage.removeItem("hv_theme_color");
    setThemeColorState(color);
    applyThemeCssVars(color, darkMode);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("hv_dark_mode", String(next));
    applyThemeCssVars(themeColor, next);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, setCustomColor, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
