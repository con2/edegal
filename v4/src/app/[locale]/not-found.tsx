import { getLocale } from "next-intl/server";

import { ErrorMessage } from "@/components/ErrorMessage";
import { getTranslations } from "@/translations";

export default async function NotFound() {
  const t = getTranslations(await getLocale());
  return <ErrorMessage>{t.Errors.notFound}</ErrorMessage>;
}
