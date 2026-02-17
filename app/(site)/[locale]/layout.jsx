import { notFound } from "next/navigation";

import CustomHeadSnippet from "../../components/CustomHeadSnippet";
import { getCustomHeader } from "../../../lib/customHeader";
import { DEFAULT_GENERAL_SETTINGS } from "../../../lib/generalSettings";
import { buildCopperThemeCss } from "../../../lib/themeColor";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale?.toLowerCase();

  if (!["en", "ru"].includes(locale)) {
    notFound();
  }

  const customHeader = await getCustomHeader("dental-implant");
  const themeCss = buildCopperThemeCss(
    DEFAULT_GENERAL_SETTINGS.primaryColor,
    DEFAULT_GENERAL_SETTINGS.styles
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <CustomHeadSnippet html={customHeader?.content} />
      {children}
      {customHeader?.bodyContent ? (
        <div dangerouslySetInnerHTML={{ __html: customHeader.bodyContent }} />
      ) : null}
    </>
  );
}
