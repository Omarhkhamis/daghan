import defaultSeoCopy from "../locales/seo.json";
import { prisma } from "./prisma";
import { normalizeLocale, normalizeSite } from "./sites";

const DEFAULT_SEO_COPY = defaultSeoCopy;

const getDefaultSeoCopy = (site = "dental-implant", locale = "en") => {
  const siteId = normalizeSite(site) || "dental-implant";
  const lang = normalizeLocale(locale);
  return (
    DEFAULT_SEO_COPY[siteId]?.[lang] ||
    DEFAULT_SEO_COPY[siteId]?.en || {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: null
    }
  );
};

export const ensureSeoSettings = async (
  site = "dental-implant",
  locale = "en"
) => {
  const siteId = normalizeSite(site) || "dental-implant";
  const lang = normalizeLocale(locale);
  const defaults = getDefaultSeoCopy(siteId, lang);
  const existing = await prisma.seoSettings.findUnique({
    where: { site_locale: { site: siteId, locale: lang } }
  });
  if (existing) {
    const updateData = {};
    if (!String(existing.metaTitle || "").trim()) {
      updateData.metaTitle = defaults.metaTitle;
    }
    if (!String(existing.metaDescription || "").trim()) {
      updateData.metaDescription = defaults.metaDescription;
    }
    if (!String(existing.metaKeywords || "").trim() && defaults.metaKeywords) {
      updateData.metaKeywords = defaults.metaKeywords;
    }
    if (Object.keys(updateData).length) {
      return prisma.seoSettings.update({
        where: { site_locale: { site: siteId, locale: lang } },
        data: updateData
      });
    }
    return existing;
  }

  try {
    return await prisma.seoSettings.create({
      data: {
        site: siteId,
        locale: lang,
        metaTitle: defaults.metaTitle,
        metaDescription: defaults.metaDescription,
        metaKeywords: defaults.metaKeywords,
        metaImage: null
      }
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return prisma.seoSettings.findUnique({
        where: { site_locale: { site: siteId, locale: lang } }
      });
    }
    throw error;
  }
};

export const getSeoSettings = async (site = "dental-implant", locale = "en") => {
  const settings = await ensureSeoSettings(site, locale);
  return settings;
};
