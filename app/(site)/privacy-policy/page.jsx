import DentalFooter from "../dental-implant/en/components/Footer";
import DentalHeader from "../dental-implant/en/components/Header";
import CustomHeadSnippet from "../../components/CustomHeadSnippet";
import { getCustomHeader } from "../../../lib/customHeader";
import { getGeneralSettings } from "../../../lib/generalSettings";
import { getPageBySlug } from "../../../lib/pages";
import { normalizeLocale } from "../../../lib/sites";

export const dynamic = "force-dynamic";

const renderParagraphs = (content) =>
  String(content || "")
    .split(/\n\s*\n/)
    .filter(Boolean);

const SITE = "dental-implant";

export default async function PrivacyPolicyPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const locale = normalizeLocale(resolvedSearchParams?.locale);

  const [general, page, customHeader] = await Promise.all([
    getGeneralSettings(SITE),
    getPageBySlug("privacy-policy", locale),
    getCustomHeader(SITE)
  ]);

  if (!page) {
    return null;
  }

  return (
    <>
      <CustomHeadSnippet html={customHeader?.content} />
      <DentalHeader general={general} locale={locale} />
      <main className="mx-auto min-h-[70vh] max-w-screen-md px-6 lg:px-10 py-16 lg:py-20 pt-24 flex items-center">
        <div className="w-full">
          <h1 className="mt-2 text-3xl sm:text-4xl font-extralight text-main-900">
            {page.title}
          </h1>
          <div className="mt-6 space-y-4 text-sm sm:text-[15px] leading-relaxed text-main-700 font-light">
            {renderParagraphs(page.content).map((paragraph, index) => (
              <p key={`privacy-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
      <DentalFooter general={general} locale={locale} site={SITE} />
      {customHeader?.bodyContent ? (
        <div dangerouslySetInnerHTML={{ __html: customHeader.bodyContent }} />
      ) : null}
    </>
  );
}
