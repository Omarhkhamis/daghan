"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyAdminCredentials } from "@lib/adminAuth";

const DEFAULT_SITE = "dental-implant";

export const loginUnifiedAction = async (formData) => {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    redirect("/admin90?error=1");
  }

  await createAdminSession(user.id);
  redirect("/admin90/overview");
};
