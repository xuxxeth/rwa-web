import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const languages: Record<string, string> = {
  en: 'English',
  zh: '繁体中文'
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
      },
      lng: "en", // 默认语言
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
}



export default i18n;
