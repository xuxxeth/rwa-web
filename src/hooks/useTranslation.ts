import { useEffect, useState } from "react";

export * from "react-i18next";

export function useI18nLanguage(i18n: any) {
  const [lang, setLang] = useState(i18n.language)
  useEffect(() => {
    const onChange = (lng: string) => setLang(lng)
    i18n.on('languageChanged', onChange)
    return () => i18n.off('languageChanged', onChange)
  }, [i18n])
  return lang
}

