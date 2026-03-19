/** Lightweight i18n hook backed by Zustand. */

import { create } from "zustand";
import { translations, type Lang, type TranslationKey } from "./translations";

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: (typeof navigator !== "undefined" && navigator.language.startsWith("fr")) ? "fr" : "en",
  setLang: (lang) => set({ lang }),
}));

/**
 * Main i18n hook.
 * Returns `t(key)` to translate, `lang` for current language,
 * `setLang` to switch, and helpers.
 */
export function useI18n() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const entry = translations[key];
    if (!entry) return key;
    let text: string = entry[lang] ?? entry.en ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return text;
  }

  /** Translate a country code to its localized name. */
  function countryName(code: string): string {
    const key = `country_name.${code}` as TranslationKey;
    if (key in translations) return t(key);
    return code;
  }

  /** Translate a region id to its localized name. */
  function regionName(id: string): string {
    const key = `region.${id}` as TranslationKey;
    if (key in translations) return t(key);
    return id;
  }

  /** Translate a stress status. */
  function stressLabel(status: string): string {
    const key = `stress.${status}` as TranslationKey;
    if (key in translations) return t(key);
    return status;
  }

  /** Translate an action type. */
  function actionLabel(type: string): string {
    const key = `action.${type}` as TranslationKey;
    if (key in translations) return t(key);
    return type.replace(/_/g, " ");
  }

  /** Translate a rule id. */
  function ruleName(id: string): string {
    const key = `rule.${id}` as TranslationKey;
    if (key in translations) return t(key);
    return id;
  }

  return { lang, setLang, t, countryName, regionName, stressLabel, actionLabel, ruleName };
}
