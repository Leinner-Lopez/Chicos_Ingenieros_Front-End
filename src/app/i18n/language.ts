export const SUPPORTED_LANGS = ['es', 'en'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: AppLang = 'es';
export const LANG_STORAGE_KEY = 'zenkai-lang';
export const LANG_TO_LOCALE: Record<AppLang, string> = { es: 'es-CO', en: 'en-US' };
