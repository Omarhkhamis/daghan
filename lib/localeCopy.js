import arUi from "../locales/ui/ar.json";
import enUi from "../locales/ui/en.json";
import ruUi from "../locales/ui/ru.json";
import trUi from "../locales/ui/tr.json";
import {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  normalizeLocale
} from "./sites";

export const LOCALE_UI_COPY = {
  en: enUi,
  tr: trUi,
  ar: arUi,
  ru: ruUi
};

export const getLocaleUi = (locale = DEFAULT_LOCALE) =>
  LOCALE_UI_COPY[normalizeLocale(locale)] || LOCALE_UI_COPY[DEFAULT_LOCALE];

export const getLocaleOptions = () => LOCALE_DEFINITIONS;
