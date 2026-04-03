import { notFound, redirect } from "next/navigation";
import { SUPPORTED_LOCALES } from "../../../../lib/sites";

export default async function LegacyDentalImplantLocalePage({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || "").toLowerCase();
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  redirect(`/${locale}`);
}
