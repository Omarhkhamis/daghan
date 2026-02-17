import { notFound, redirect } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "ru"];

export default async function LegacyDentalImplantLocalePage({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || "").toLowerCase();
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  redirect(`/${locale}`);
}
