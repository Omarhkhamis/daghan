"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import LocaleFlag from "../../../../components/LocaleFlag";
import { getLocaleOptions } from "../../../../../lib/localeCopy";
import { SUPPORTED_LOCALES, normalizeLocale } from "../../../../../lib/sites";

export default function LocaleDropdown({ locale = "en" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const toggle = () => setOpen((prev) => !prev);
  const current = normalizeLocale(locale);
  const options = getLocaleOptions();

  const buildHref = (targetLocale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && SUPPORTED_LOCALES.includes(segments[0])) {
      segments[0] = targetLocale;
      return `/${segments.join("/")}`;
    }

    if (["/thankyou", "/privacy-policy", "/terms"].includes(pathname)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("locale", targetLocale);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    }

    return `/${targetLocale}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-9 items-center justify-center rounded-full border border-transparent bg-transparent px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 hover:text-copper-500 transition"
      >
        <LocaleFlag code={current} />
        <span className="ml-1 text-slate-400">▾</span>
      </button>
      {open ? (
        <div className="absolute right-0 mt-1 w-28 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
          {options.map((item) => (
            <a
              key={item.code}
              href={buildHref(item.code)}
              className={`flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-slate-50 ${
                item.code === current
                  ? "bg-slate-50 text-copper-700"
                  : "text-slate-600"
              }`}
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
              <LocaleFlag code={item.code} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
