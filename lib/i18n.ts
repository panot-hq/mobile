import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createMMKV } from "react-native-mmkv";

import en from "./locales/en-US/translations.json";
import es from "./locales/es-ES/translations.json";

export const LANGUAGES = [
  { code: "en-US", name: "English" },
  { code: "es-ES", name: "Spanish" },
];

const storage = createMMKV();
const LANGUAGE_KEY = "app_language";

const getLanguage = () => {
  const storedLanguage = storage.getString(LANGUAGE_KEY);
  if (storedLanguage) {
    return storedLanguage;
  }
  const deviceLanguage = getLocales()[0]?.languageTag;
  return deviceLanguage === "es-ES" ? "es-ES" : "en-US";
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    "en-US": { translation: en },
    "es-ES": { translation: es },
  },
  lng: getLanguage(),
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  storage.set(LANGUAGE_KEY, lang);
};

export default i18n;
