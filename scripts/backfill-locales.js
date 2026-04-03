const { PrismaClient } = require("@prisma/client");

const DEFAULT_PAGE_COPY = require("../locales/pages.json");
const DEFAULT_SEO_COPY = require("../locales/seo.json");
const SECTION_PATCHES = {
  "dental-implant": {
    tr: require("../locales/sections/dental-implant/tr.json"),
    ar: require("../locales/sections/dental-implant/ar.json")
  }
};

const prisma = new PrismaClient();

const TARGET_LOCALES = ["tr", "ar"];
const SOURCE_PRIORITY = ["en", "ru"];

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return value == null ? value : JSON.parse(JSON.stringify(value));
};

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const mergeLocalizedData = (source, patch) => {
  if (patch === undefined) return cloneValue(source);
  if (source === undefined) return cloneValue(patch);

  if (Array.isArray(source) || Array.isArray(patch)) {
    const sourceArray = Array.isArray(source) ? source : [];
    const patchArray = Array.isArray(patch) ? patch : [];
    const maxLength = Math.max(sourceArray.length, patchArray.length);
    return Array.from({ length: maxLength }, (_, index) =>
      mergeLocalizedData(sourceArray[index], patchArray[index])
    );
  }

  if (isObject(source) || isObject(patch)) {
    const sourceObject = isObject(source) ? source : {};
    const patchObject = isObject(patch) ? patch : {};
    const result = {};
    const keys = new Set([
      ...Object.keys(sourceObject),
      ...Object.keys(patchObject)
    ]);
    for (const key of keys) {
      result[key] = mergeLocalizedData(sourceObject[key], patchObject[key]);
    }
    return result;
  }

  return cloneValue(patch);
};

const pickSourceLocale = (locales) => {
  for (const locale of SOURCE_PRIORITY) {
    if (locales.includes(locale)) return locale;
  }
  return locales[0] || null;
};

const buildLocalizedSectionData = (site, key, sourceData, targetLocale) => {
  const patch = SECTION_PATCHES?.[site]?.[targetLocale]?.[key];
  if (!patch) return cloneValue(sourceData);
  return mergeLocalizedData(sourceData, patch);
};

async function backfillPages() {
  const pages = await prisma.page.findMany({
    select: { slug: true, title: true, content: true }
  });

  const localeSuffixes = new Set(["en", "ru", "tr", "ar"]);
  const grouped = new Map();

  for (const page of pages) {
    const parts = page.slug.split("-");
    const suffix = parts.at(-1);
    const hasLocaleSuffix = localeSuffixes.has(suffix);
    const baseSlug = hasLocaleSuffix ? parts.slice(0, -1).join("-") : page.slug;
    if (!grouped.has(baseSlug)) {
      grouped.set(baseSlug, {});
    }
    const bucket = grouped.get(baseSlug);
    bucket[hasLocaleSuffix ? suffix : "base"] = page;
  }

  let writes = 0;

  for (const [baseSlug, variants] of grouped.entries()) {
    const source = variants.en || variants.ru || variants.base;
    if (!source) continue;

    for (const locale of TARGET_LOCALES) {
      const slug = `${baseSlug}-${locale}`;
      const localizedCopy = DEFAULT_PAGE_COPY[baseSlug]?.[locale];
      const nextTitle = localizedCopy?.title || source.title;
      const nextContent = localizedCopy?.content || source.content;
      const existing = variants[locale];

      if (existing) {
        const needsUpdate =
          existing.title !== nextTitle || existing.content !== nextContent;
        if (needsUpdate) {
          await prisma.page.update({
            where: { slug },
            data: {
              title: nextTitle,
              content: nextContent
            }
          });
          writes += 1;
        }
        continue;
      }

      await prisma.page.create({
        data: {
          slug,
          title: nextTitle,
          content: nextContent
        }
      });
      writes += 1;
    }
  }

  return writes;
}

async function backfillSeo() {
  const seoRows = await prisma.seoSettings.findMany();
  const grouped = new Map();

  for (const row of seoRows) {
    if (!grouped.has(row.site)) grouped.set(row.site, []);
    grouped.get(row.site).push(row);
  }

  let writes = 0;

  for (const [site, rows] of grouped.entries()) {
    const sourceLocale = pickSourceLocale(rows.map((row) => row.locale));
    const source = rows.find((row) => row.locale === sourceLocale);
    if (!source) continue;

    for (const locale of TARGET_LOCALES) {
      const localizedDefaults = DEFAULT_SEO_COPY[site]?.[locale] || null;
      const existing = rows.find((row) => row.locale === locale);
      const nextData = {
        metaTitle:
          localizedDefaults?.metaTitle ||
          existing?.metaTitle ||
          source.metaTitle ||
          "",
        metaDescription:
          localizedDefaults?.metaDescription ||
          existing?.metaDescription ||
          source.metaDescription ||
          "",
        metaKeywords:
          localizedDefaults?.metaKeywords ||
          existing?.metaKeywords ||
          source.metaKeywords ||
          null,
        metaImage: existing?.metaImage || source.metaImage || null
      };

      if (existing) {
        const needsUpdate =
          existing.metaTitle !== nextData.metaTitle ||
          existing.metaDescription !== nextData.metaDescription ||
          (existing.metaKeywords || null) !== (nextData.metaKeywords || null) ||
          (existing.metaImage || null) !== (nextData.metaImage || null);

        if (needsUpdate) {
          await prisma.seoSettings.update({
            where: { site_locale: { site, locale } },
            data: nextData
          });
          writes += 1;
        }
        continue;
      }

      await prisma.seoSettings.create({
        data: {
          site,
          locale,
          ...nextData
        }
      });
      writes += 1;
    }
  }

  return writes;
}

async function backfillSections() {
  const sectionRows = await prisma.section.findMany({
    orderBy: [{ site: "asc" }, { locale: "asc" }, { sortOrder: "asc" }]
  });

  const grouped = new Map();
  for (const row of sectionRows) {
    const siteBucket = grouped.get(row.site) || [];
    siteBucket.push(row);
    grouped.set(row.site, siteBucket);
  }

  let writes = 0;

  for (const [site, rows] of grouped.entries()) {
    const locales = Array.from(new Set(rows.map((row) => row.locale)));
    const sourceLocale = pickSourceLocale(locales);
    const sourceRows = rows.filter((row) => row.locale === sourceLocale);
    if (!sourceRows.length) continue;

    for (const targetLocale of TARGET_LOCALES) {
      const targetRows = rows.filter((row) => row.locale === targetLocale);
      const targetMap = new Map(targetRows.map((row) => [row.key, row]));

      for (const sourceRow of sourceRows) {
        const localizedData = buildLocalizedSectionData(
          site,
          sourceRow.key,
          sourceRow.data,
          targetLocale
        );

        const data = {
          label: sourceRow.label,
          enabled: sourceRow.enabled,
          sortOrder: sourceRow.sortOrder,
          data: localizedData
        };

        const existing = targetMap.get(sourceRow.key);
        if (existing) {
          await prisma.section.update({
            where: {
              key_locale_site: {
                key: sourceRow.key,
                locale: targetLocale,
                site
              }
            },
            data
          });
          writes += 1;
          continue;
        }

        await prisma.section.create({
          data: {
            key: sourceRow.key,
            locale: targetLocale,
            site,
            ...data
          }
        });
        writes += 1;
      }
    }
  }

  return writes;
}

async function main() {
  const [pageWrites, seoWrites, sectionWrites] = await Promise.all([
    backfillPages(),
    backfillSeo(),
    backfillSections()
  ]);

  const [sections, seo] = await Promise.all([
    prisma.section.groupBy({ by: ["site", "locale"], _count: { _all: true } }),
    prisma.seoSettings.groupBy({
      by: ["site", "locale"],
      _count: { _all: true }
    })
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        writes: {
          pages: pageWrites,
          seo: seoWrites,
          sections: sectionWrites
        },
        sections,
        seo
      },
      null,
      2
    )
  );
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
