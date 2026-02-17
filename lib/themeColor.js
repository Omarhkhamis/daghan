const HEX_COLOR_RE = /^#?[0-9a-fA-F]{6}$/;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toHex = (value) =>
  clamp(Math.round(value), 0, 255)
    .toString(16)
    .padStart(2, "0");

const mix = (a, b, ratio) => {
  const t = clamp(ratio, 0, 1);
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  };
};

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
};

const rgbToHex = ({ r, g, b }) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const OPACITY_STEPS = [10, 18, 20, 25, 30, 40, 45, 50, 60, 70, 80, 90, 95, 100];

const cssOpacity = (value) => (value >= 100 ? "1" : String(value / 100));

const classWithOpacity = (baseClass, opacity) => {
  if (!opacity || opacity >= 100) return baseClass;
  return `${baseClass}\\/${opacity}`;
};

const colorExpr = (shade, opacity) => {
  if (!opacity || opacity >= 100) {
    return `rgb(var(--color-copper-${shade}-rgb))`;
  }
  return `rgb(var(--color-copper-${shade}-rgb) / ${cssOpacity(opacity)})`;
};

const pushColorRules = (rules, prefix, cssProp, pseudo = "") => {
  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
    for (const opacity of OPACITY_STEPS) {
      const className = classWithOpacity(`${prefix}-copper-${shade}`, opacity);
      const suffix = pseudo ? `:${pseudo}` : "";
      rules.push(`.${className}${suffix}{${cssProp}:${colorExpr(shade, opacity)};}`);
    }
  }
};

export const FONT_OPTIONS = {
  inter:
    "Inter, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  poppins:
    "Poppins, Inter, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  montserrat:
    "Montserrat, Inter, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  georgia: "Georgia, Cambria, Times New Roman, Times, serif"
};

export const normalizeHexColor = (value, fallback = "#5a918a") => {
  const raw = String(value || "").trim();
  if (!HEX_COLOR_RE.test(raw)) return fallback;
  return raw.startsWith("#") ? raw.toLowerCase() : `#${raw.toLowerCase()}`;
};

export const normalizeFontChoice = (value) => {
  const key = String(value || "").trim().toLowerCase();
  return Object.hasOwn(FONT_OPTIONS, key) ? key : "inter";
};

export const normalizeButtonStyle = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "gradient" ? "gradient" : "solid";
};

export const buildCopperPalette = (primaryColor) => {
  const primary = hexToRgb(normalizeHexColor(primaryColor));
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  return {
    50: mix(primary, white, 0.86),
    100: mix(primary, white, 0.74),
    200: mix(primary, white, 0.54),
    300: mix(primary, white, 0.34),
    400: mix(primary, white, 0.18),
    500: primary,
    600: mix(primary, black, 0.13),
    700: mix(primary, black, 0.27),
    800: mix(primary, black, 0.41),
    900: mix(primary, black, 0.58)
  };
};

export const buildCopperThemeCss = (primaryColor, styleSettings = {}) => {
  const palette = buildCopperPalette(primaryColor);
  const entries = Object.entries(palette);

  const vars = entries
    .map(([shade, rgb]) => {
      const hex = rgbToHex(rgb);
      const rgbValue = `${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}`;
      return `--color-copper-${shade}:${hex};--color-copper-${shade}-rgb:${rgbValue};`;
    })
    .join("");

  const rules = [];

  pushColorRules(rules, "text", "color");
  pushColorRules(rules, "bg", "background-color");
  pushColorRules(rules, "border", "border-color");

  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
    for (const opacity of OPACITY_STEPS) {
      const ringClass = classWithOpacity(`ring-copper-${shade}`, opacity);
      rules.push(`.${ringClass}{--tw-ring-color:${colorExpr(shade, opacity)};}`);

      const fromClass = classWithOpacity(`from-copper-${shade}`, opacity);
      rules.push(`.${fromClass}{--tw-gradient-from:${colorExpr(shade, opacity)} var(--tw-gradient-from-position);--tw-gradient-to:rgb(var(--color-copper-${shade}-rgb) / 0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to);}`);

      const viaClass = classWithOpacity(`via-copper-${shade}`, opacity);
      rules.push(`.${viaClass}{--tw-gradient-to:rgb(var(--color-copper-${shade}-rgb) / 0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),${colorExpr(shade, opacity)} var(--tw-gradient-via-position),var(--tw-gradient-to);}`);

      const toClass = classWithOpacity(`to-copper-${shade}`, opacity);
      rules.push(`.${toClass}{--tw-gradient-to:${colorExpr(shade, opacity)} var(--tw-gradient-to-position);}`);

      const focusBorder = classWithOpacity(`focus\\:border-copper-${shade}`, opacity);
      rules.push(`.${focusBorder}:focus{border-color:${colorExpr(shade, opacity)};}`);

      const focusRing = classWithOpacity(`focus\\:ring-copper-${shade}`, opacity);
      rules.push(`.${focusRing}:focus{--tw-ring-color:${colorExpr(shade, opacity)};}`);

      const hoverBg = classWithOpacity(`hover\\:bg-copper-${shade}`, opacity);
      rules.push(`.${hoverBg}:hover{background-color:${colorExpr(shade, opacity)};}`);

      const hoverText = classWithOpacity(`hover\\:text-copper-${shade}`, opacity);
      rules.push(`.${hoverText}:hover{color:${colorExpr(shade, opacity)};}`);

      const hoverBorder = classWithOpacity(`hover\\:border-copper-${shade}`, opacity);
      rules.push(`.${hoverBorder}:hover{border-color:${colorExpr(shade, opacity)};}`);
    }
  }

  const backgroundColor = normalizeHexColor(styleSettings.backgroundColor, "#ffffff");
  const textColor = normalizeHexColor(styleSettings.textColor, "#0f172a");
  const fontFamily = FONT_OPTIONS[normalizeFontChoice(styleSettings.fontFamily)];
  const buttonStyle = normalizeButtonStyle(styleSettings.buttonStyle);

  const siteBaseCss = `
body[data-site-theme="1"]{background-color:${backgroundColor};color:${textColor};font-family:${fontFamily};}
body[data-site-theme="1"] a,body[data-site-theme="1"] button{font-family:inherit;}
`;

  const siteButtonCss =
    buttonStyle === "solid"
      ? `
body[data-site-theme="1"] :is(a,button)[class*="bg-gradient-to-r"][class*="from-copper-"][class*="to-copper-"]{background-image:none!important;background-color:rgb(var(--color-copper-600-rgb))!important;}
body[data-site-theme="1"] :is(a,button)[class*="bg-gradient-to-r"][class*="from-copper-"][class*="to-copper-"]:hover{background-image:none!important;background-color:rgb(var(--color-copper-700-rgb))!important;}
`
      : `
body[data-site-theme="1"] :is(a,button)[class*="bg-gradient-to-r"][class*="from-copper-"][class*="to-copper-"]{background-image:linear-gradient(90deg,rgb(var(--color-copper-500-rgb)) 0%,#000 100%)!important;color:#fff!important;border:1px solid transparent!important;}
body[data-site-theme="1"] :is(a,button)[class*="bg-gradient-to-r"][class*="from-copper-"][class*="to-copper-"]:hover{background-image:none!important;background-color:#fff!important;color:rgb(var(--color-copper-500-rgb))!important;border-color:rgb(var(--color-copper-500-rgb))!important;}
`;

  return `:root{${vars}}\n${siteBaseCss}\n${siteButtonCss}\n${rules.join("\n")}`;
};
