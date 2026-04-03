import dentalImplantArSections from "../locales/sections/dental-implant/ar.json";
import dentalImplantEnSections from "../locales/sections/dental-implant/en.json";
import dentalImplantRuSections from "../locales/sections/dental-implant/ru.json";
import dentalImplantTrSections from "../locales/sections/dental-implant/tr.json";
import { normalizeLocale, normalizeSite } from "./sites";

export const DENTAL_SECTION_DEFAULTS_EN = dentalImplantEnSections;
export const DENTAL_SECTION_DEFAULTS_TR = dentalImplantTrSections;
export const DENTAL_SECTION_DEFAULTS_AR = dentalImplantArSections;
export const DENTAL_SECTION_DEFAULTS_RU = dentalImplantRuSections;

export const heroDefaults = DENTAL_SECTION_DEFAULTS_EN.hero;
export const dentalImplantDefaults = DENTAL_SECTION_DEFAULTS_EN.dentalImplant;
export const popularTreatmentsDefaults =
  DENTAL_SECTION_DEFAULTS_EN.popularTreatments;
export const bookAppointmentDefaults =
  DENTAL_SECTION_DEFAULTS_EN.bookAppointmentPrimary;
export const beforeAfterDefaults = DENTAL_SECTION_DEFAULTS_EN.beforeAfter;
export const certificatesGalleryDefaults =
  DENTAL_SECTION_DEFAULTS_EN.certificatesGallery;
export const fullWidthCampaignDefaults =
  DENTAL_SECTION_DEFAULTS_EN.fullWidthCampaign;
export const stepFormDefaults = DENTAL_SECTION_DEFAULTS_EN.stepForm;
export const treatmentsDefaults = DENTAL_SECTION_DEFAULTS_EN.treatments;
export const teamMembersDefaults = DENTAL_SECTION_DEFAULTS_EN.teamMembers;
export const bookAppointmentSecondaryDefaults =
  DENTAL_SECTION_DEFAULTS_EN.bookAppointmentSecondary;
export const internationalPatientsDefaults =
  DENTAL_SECTION_DEFAULTS_EN.internationalPatients;
export const clinicDefaults = DENTAL_SECTION_DEFAULTS_EN.clinic;
export const healthTourismDefaults = DENTAL_SECTION_DEFAULTS_EN.healthTourism;
export const luckySpinDefaults = DENTAL_SECTION_DEFAULTS_EN.luckySpin;
export const googleReviewsDefaults = DENTAL_SECTION_DEFAULTS_EN.googleReviews;
export const trustpilotReviewsDefaults =
  DENTAL_SECTION_DEFAULTS_EN.trustpilotReviews;
export const faqsDefaults = DENTAL_SECTION_DEFAULTS_EN.faqs;
export const implantMatrixDefaults = DENTAL_SECTION_DEFAULTS_EN.implantMatrix;
export const techniquesUsedDefaults = DENTAL_SECTION_DEFAULTS_EN.techniquesUsed;

export const SECTION_DEFAULTS_RU = DENTAL_SECTION_DEFAULTS_RU;

const SITE_SECTION_DEFAULTS = {
  "dental-implant": {
    en: DENTAL_SECTION_DEFAULTS_EN,
    tr: DENTAL_SECTION_DEFAULTS_TR,
    ar: DENTAL_SECTION_DEFAULTS_AR,
    ru: DENTAL_SECTION_DEFAULTS_RU
  }
};

const mergeLocalizedDefaults = (base, localized) => {
  if (localized === null || typeof localized === "undefined") return base;
  if (Array.isArray(base)) {
    return Array.isArray(localized) ? localized : base;
  }
  if (base && typeof base === "object") {
    const merged = { ...base };
    if (localized && typeof localized === "object") {
      for (const [key, value] of Object.entries(localized)) {
        merged[key] = mergeLocalizedDefaults(base[key], value);
      }
    }
    return merged;
  }
  return localized;
};

export const getSectionDefaults = (
  key,
  locale = "en",
  site = "dental-implant"
) => {
  const siteId = normalizeSite(site) || "dental-implant";
  const lang = normalizeLocale(locale);
  const defaultsBySite = SITE_SECTION_DEFAULTS[siteId] || {};
  const baseDefaults =
    defaultsBySite.en?.[key] ||
    SITE_SECTION_DEFAULTS["dental-implant"].en?.[key] ||
    null;
  const localizedDefaults = defaultsBySite[lang]?.[key];

  return mergeLocalizedDefaults(baseDefaults, localizedDefaults) || null;
};
