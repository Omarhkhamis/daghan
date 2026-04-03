"use client";

import { useSearchParams, usePathname } from "next/navigation";
import LocaleFlag from "../../../components/LocaleFlag";
import { getLocaleOptions } from "../../../../lib/localeCopy";
import { normalizeLocale } from "../../../../lib/sites";

export default function LocaleSwitcher({ locale: localeProp }) {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const current = normalizeLocale(localeProp || searchParams.get("locale"));
  const options = getLocaleOptions();

  return (
    <div className="inline-flex rounded-lg bg-white p-1 text-xs font-semibold uppercase tracking-[0.2em]">
      {options.map((item) => {
        const active = item.code === current;
        const params = new URLSearchParams(searchParams.toString());
        params.set("locale", item.code);
        const href = `${pathname}?${params.toString()}`;
        return (
          <a
            key={item.code}
            href={href}
            className={`px-3 py-1 rounded-md transition ${
              active
                ? "bg-copper-50 border border-copper-200 text-copper-700"
                : "text-slate-600 hover:text-copper-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LocaleFlag code={item.code} className="ring-1 ring-slate-200" />
              {item.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
