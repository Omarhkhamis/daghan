import defaultPageCopy from "../locales/pages.json";
import { prisma } from "./prisma";
import { normalizeLocale, SUPPORTED_LOCALES } from "./sites";

const DEFAULT_PAGE_COPY = defaultPageCopy;

const DEFAULT_PAGES = Object.entries(DEFAULT_PAGE_COPY).flatMap(
  ([slug, locales]) => {
    const fallback = locales.en || Object.values(locales)[0] || {
      title: "",
      content: ""
    };
    const localized = SUPPORTED_LOCALES.map((locale) => ({
      slug: `${slug}-${locale}`,
      ...(locales[locale] || fallback)
    }));
    return [{ slug, ...fallback }, ...localized];
  }
);

const ensurePages = async () => {
  const existing = await prisma.page.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map((item) => item.slug));

  const createData = DEFAULT_PAGES.filter(
    (page) => !existingSlugs.has(page.slug)
  );

  if (createData.length) {
    await prisma.page.createMany({ data: createData, skipDuplicates: true });
  }
};

export const getPageBySlug = async (slug, locale) => {
  await ensurePages();
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale) {
    const localized = await prisma.page.findUnique({
      where: { slug: `${slug}-${normalizedLocale}` }
    });
    if (localized) return localized;
  }
  return prisma.page.findUnique({ where: { slug } });
};

export const getPages = async () => {
  await ensurePages();
  return prisma.page.findMany({ orderBy: { title: "asc" } });
};
