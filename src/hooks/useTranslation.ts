import { useEffect, useState } from "react";
import { Trans, useTranslation as useI18nextTranslation } from "react-i18next";

export { Trans };

export function useI18nLanguage(i18n: any) {
  const [lang, setLang] = useState(i18n.language)
  useEffect(() => {
    const onChange = (lng: string) => setLang(lng)
    i18n.on('languageChanged', onChange)
    return () => i18n.off('languageChanged', onChange)
  }, [i18n])
  return lang
}

export function useTranslation(...args: Parameters<typeof useI18nextTranslation>) {
  const res = useI18nextTranslation(...args)
  useI18nLanguage(res.i18n)
  return res
}
