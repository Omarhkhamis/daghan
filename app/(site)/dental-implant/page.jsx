import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "../../../lib/sites";

export default function DentalImplantRootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
