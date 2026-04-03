import { Tajawal } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap"
});

export const getLocaleFontClassName = (locale) =>
  String(locale || "").toLowerCase() === "ar" ? tajawal.className : "";
