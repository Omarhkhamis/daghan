import { notFound } from "next/navigation";

import CustomHeadSnippet from "../../components/CustomHeadSnippet";
import { getCustomHeader } from "../../../lib/customHeader";
import { DEFAULT_GENERAL_SETTINGS } from "../../../lib/generalSettings";
import { getLocaleFontClassName } from "../../../lib/localeFont";
import { isRtlLocale, SUPPORTED_LOCALES } from "../../../lib/sites";
import { buildCopperThemeCss } from "../../../lib/themeColor";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale?.toLowerCase();

  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  const customHeader = await getCustomHeader("dental-implant");
  const themeCss = buildCopperThemeCss(
    DEFAULT_GENERAL_SETTINGS.primaryColor,
    DEFAULT_GENERAL_SETTINGS.styles
  );
  const localeFontClassName = getLocaleFontClassName(locale);

  return (
    <div
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={localeFontClassName}
    >
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <CustomHeadSnippet html={customHeader?.content} />
      {children}
      {customHeader?.bodyContent ? (
        <div dangerouslySetInnerHTML={{ __html: customHeader.bodyContent }} />
      ) : null}
    </div>
  );
}
