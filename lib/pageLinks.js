import { getLocaleUi } from "./localeCopy";
import { getLocaleFromPath } from "./sites";

export const buildPrivacyPolicyLink = (pathname = "") => {
  const params = new URLSearchParams();
  const locale = getLocaleFromPath(pathname);

  if (locale) {
    params.set("locale", locale);
  }

  const normalized = String(pathname || "").toLowerCase();
  if (normalized.startsWith("/dental-implant")) {
    params.set("site", "dental-implant");
  }

  const query = params.toString();
  return query ? `/privacy-policy?${query}` : "/privacy-policy";
};

export const getPrivacyConsentText = (pathname = "") => {
  const locale = getLocaleFromPath(pathname);
  return getLocaleUi(locale).forms.privacyConsent;
};
