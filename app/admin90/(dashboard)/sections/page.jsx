import ReorderSections from "../components/ReorderSections";
import { getLocaleOptions } from "@lib/localeCopy";
import { getSectionsByLocale } from "@lib/sections";
import { normalizeLocale, normalizeSite } from "@lib/sites";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function SectionsReorderPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const site = normalizeSite(resolvedSearchParams?.site) || "dental-implant";
  const locale = normalizeLocale(resolvedSearchParams?.locale);
  const sections = await getSectionsByLocale(site, locale);
  const reordered = resolvedSearchParams?.reordered === "1";
  const localeOptions = getLocaleOptions();

  return (
    <AdminShell site={site} locale={locale}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Sections
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Reorder Sections ({locale.toUpperCase()})
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Drag-and-drop or use arrows to set the display order on the landing page.
          </p>
        </div>
        {reordered ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            Order saved
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 flex-wrap">
        {localeOptions.map((item) => (
          <a
            key={item.code}
            href={`/admin90/sections?locale=${item.code}`}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              locale === item.code
                ? "border-copper-500 text-copper-700 bg-copper-50"
                : "border-slate-200 text-slate-600 bg-white"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      <ReorderSections site={site} initialSections={sections} locale={locale} />
      </div>
    </AdminShell>
  );
}
