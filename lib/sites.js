export const SITES = [
  { id: "dental-implant", label: "Dental Implant" }
];

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "tr", "ar", "ru"];

export const LOCALE_DEFINITIONS = [
  {
    code: "en",
    label: "EN",
    nativeLabel: "English",
    dir: "ltr"
  },
  {
    code: "tr",
    label: "TR",
    nativeLabel: "Turkce",
    dir: "ltr"
  },
  {
    code: "ar",
    label: "AR",
    nativeLabel: "العربية",
    dir: "rtl"
  },
  {
    code: "ru",
    label: "RU",
    nativeLabel: "Русский",
    dir: "ltr"
  }
];

export const normalizeSite = (site) => {
  const value = String(site || "").toLowerCase();
  return SITES.find((item) => item.id === value)?.id || null;
};

export const normalizeLocale = (locale) => {
  const value = String(locale || "").toLowerCase();
  return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE;
};

export const getLocaleDefinition = (locale) => {
  const lang = normalizeLocale(locale);
  return (
    LOCALE_DEFINITIONS.find((item) => item.code === lang) || LOCALE_DEFINITIONS[0]
  );
};

export const isRtlLocale = (locale) => getLocaleDefinition(locale).dir === "rtl";

export const getLocaleFromPath = (pathname = "") => {
  const segments = String(pathname || "")
    .split("?")[0]
    .toLowerCase()
    .split("/")
    .filter(Boolean);
  return normalizeLocale(segments[0]);
};
