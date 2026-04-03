import { parsePhoneNumberFromString } from "libphonenumber-js";
import { getLocaleUi } from "./localeCopy";
import { getLocaleFromPath, normalizeLocale, SUPPORTED_LOCALES } from "./sites";

let swalPromise = null;

const loadSwal = async () => {
  if (typeof window === "undefined") return null;
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((mod) => mod.default || mod);
  }
  return swalPromise;
};

const pickFirstFilled = (payload, keys) => {
  if (!payload) return "";
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const normalizePhone = (value) => {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  if (!digits) return "";
  const trimmed = digits.slice(0, 15);
  return `+${trimmed}`;
};

const isLikelyValidPhone = (value) =>
  /^\+[1-9]\d{7,14}$/.test(String(value || "").trim());

const isValidPhoneByCountry = (value) => {
  const normalized = normalizePhone(value);
  if (!normalized) return false;
  const parsed = parsePhoneNumberFromString(normalized);
  if (!parsed) return false;
  return parsed.isValid();
};

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const detectSiteFromPath = (path) => {
  const normalized = String(path || "").toLowerCase();
  if (normalized.startsWith("/dental-implant")) return "dental-implant";
  if (SUPPORTED_LOCALES.some((locale) => normalized === `/${locale}`)) {
    return "dental-implant";
  }
  return undefined;
};

const showAlert = async ({ title, text, confirmButtonText = "OK" }) => {
  if (typeof window === "undefined") return;
  try {
    const Swal = await loadSwal();
    if (Swal) {
      await Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText,
        zIndex: 1000000,
        customClass: {
          confirmButton:
            "rounded-lg bg-copper-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copper-700"
        },
        buttonsStyling: false
      });
      return;
    }
  } catch {
    // Fallback to alert below.
  }
  window.alert(text);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildFieldErrors = (entries) => {
  const errors = {};
  for (const [field, message] of entries) {
    if (field && message) errors[field] = message;
  }
  return errors;
};

const fieldErrorsFromCode = (code, locale = "en") => {
  const copy = getLocaleUi(locale).forms;
  if (code === "INVALID_PHONE") {
    return buildFieldErrors([["phone", copy.invalidPhone]]);
  }
  if (code === "INVALID_EMAIL") {
    return buildFieldErrors([["email", copy.invalidEmail]]);
  }
  if (code === "MISSING_CONTACT_INFO") {
    return buildFieldErrors([
      ["name", copy.requiredField],
      ["phone", copy.requiredField]
    ]);
  }
  return {};
};

const ensureContactFields = async (payload) => {
  const locale = normalizeLocale(payload?.locale || getLocaleFromPath(payload?.page));
  const copy = getLocaleUi(locale).forms;
  const name = pickFirstFilled(payload, ["fullName", "name", "full_name"]);
  const rawPhone = pickFirstFilled(payload, ["phone", "tel", "mobile"]);
  const phone = normalizePhone(rawPhone);
  const phoneValid = phone && isValidPhoneByCountry(phone);
  const email = pickFirstFilled(payload, ["email", "contactEmail", "userEmail"]);
  const emailValid = email ? isValidEmail(email) : true;

  if (name && phoneValid && emailValid) {
    return { ok: true, name, phone };
  }

  if (!emailValid) {
    return {
      ok: false,
      code: "INVALID_EMAIL",
      fieldErrors: buildFieldErrors([
        ["email", copy.invalidEmail]
      ])
    };
  }

  if (!name && !phone) {
    return {
      ok: false,
      code: "MISSING_CONTACT_INFO",
      fieldErrors: buildFieldErrors([
        ["name", copy.requiredField],
        ["phone", copy.requiredField]
      ])
    };
  }

  if (!name) {
    return {
      ok: false,
      code: "MISSING_CONTACT_INFO",
      fieldErrors: buildFieldErrors([["name", copy.requiredField]])
    };
  }

  if (!phone) {
    return {
      ok: false,
      code: "MISSING_CONTACT_INFO",
      fieldErrors: buildFieldErrors([["phone", copy.requiredField]])
    };
  }

  if (!phoneValid) {
    return {
      ok: false,
      code: "INVALID_PHONE",
      fieldErrors: buildFieldErrors([["phone", copy.invalidPhone]])
    };
  }

  return {
    ok: false,
    code: "MISSING_CONTACT_INFO",
    fieldErrors: buildFieldErrors([
      ["name", copy.requiredField],
      ["phone", copy.requiredField]
    ])
  };
};

export const buildFormPayload = (form, source, overrides = {}) => {
  const payload = {};
  if (form) {
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (!key) continue;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) payload[key] = trimmed;
      } else if (value != null) {
        payload[key] = String(value);
      }
    }

    if (!payload.formName && form.dataset?.formName) {
      const name = String(form.dataset.formName || "").trim();
      if (name) payload.formName = name;
    }
  }

  if (source) payload.source = source;
  if (overrides.formName) {
    payload.formName = String(overrides.formName).trim();
  }
  if (typeof window !== "undefined") {
    payload.page = window.location.pathname;
    if (!payload.locale) {
      payload.locale = getLocaleFromPath(payload.page);
    }
    if (!payload.site) {
      const detected = detectSiteFromPath(window.location.pathname);
      if (detected) payload.site = detected;
    }
  }
  if (overrides.site) {
    payload.site = overrides.site;
  }

  return payload;
};

export const submitFormPayload = async (payload, options = {}) => {
  const {
    skipRedirect = false,
    showError: showErrorAlert = true
  } = options;
  const basePayload = { ...(payload || {}) };
  if (typeof window !== "undefined") {
    if (!basePayload.page) {
      basePayload.page = window.location.pathname;
    }
    if (!basePayload.locale) {
      basePayload.locale = getLocaleFromPath(basePayload.page);
    }
    if (!basePayload.site) {
      const detected = detectSiteFromPath(basePayload.page);
      if (detected) basePayload.site = detected;
    }
  }
  const isSpin =
    basePayload.source === "lucky-spin" || Boolean(basePayload.prize);
  const locale = normalizeLocale(basePayload.locale || getLocaleFromPath(basePayload.page));
  const uiCopy = getLocaleUi(locale);
  const contact = await ensureContactFields(basePayload);
  if (!contact.ok) {
    if (showErrorAlert && Object.keys(contact.fieldErrors || {}).length) {
      const message =
        contact.fieldErrors?.email ||
        contact.fieldErrors?.phone ||
        contact.fieldErrors?.name ||
        uiCopy.forms.checkHighlightedFields;
      await showAlert({
        title: uiCopy.forms.invalidInputTitle,
        text: message,
        confirmButtonText: uiCopy.common.ok
      });
    }
    return {
      ok: false,
      error: contact.code,
      fieldErrors: contact.fieldErrors || {}
    };
  }
  const { name, phone } = contact;
  const normalizedPayload = {
    ...basePayload,
    fullName: name,
    name: basePayload?.name || name,
    phone
  };

  const response = await fetch("/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedPayload)
  });

  if (!response.ok) {
    let errorCode = "SUBMISSION_FAILED";
    try {
      const data = await response.json();
      if (data?.error) errorCode = String(data.error);
    } catch {
      // Keep default error code.
    }
    const fieldErrors = fieldErrorsFromCode(errorCode, locale);
    if (showErrorAlert && Object.keys(fieldErrors || {}).length) {
      const message =
        fieldErrors.email ||
        fieldErrors.phone ||
        fieldErrors.name ||
        uiCopy.forms.submissionFailed;
      await showAlert({
        title: uiCopy.forms.invalidInputTitle,
        text: message,
        confirmButtonText: uiCopy.common.ok
      });
    }
    return {
      ok: false,
      error: errorCode,
      fieldErrors
    };
  }

  try {
    const data = await response.json();
    if (typeof window !== "undefined" && !skipRedirect && !isSpin) {
      await sleep(3000);
      const redirectTo = data?.redirectTo || "/thankyou";
      window.location.assign(redirectTo);
    }
    return { ok: true, ...data };
  } catch {
    if (typeof window !== "undefined" && !skipRedirect && !isSpin) {
      await sleep(3000);
      window.location.assign("/thankyou");
    }
    return { ok: true };
  }
};
