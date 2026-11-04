import { isDevMode, provideAppInitializer, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './transloco-loader';
import { DEFAULT_LANG, LANG_STORAGE_KEY, LANG_TO_LOCALE, SUPPORTED_LANGS } from './language';

export const provideI18n = () => [
  provideTransloco({
    config: {
      availableLangs: [...SUPPORTED_LANGS],
      defaultLang: DEFAULT_LANG,
      fallbackLang: DEFAULT_LANG,
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader,
  }),
  provideTranslocoLocale({
    langToLocaleMapping: LANG_TO_LOCALE,
    defaultCurrency: 'COP',
  }),
  // Restaura el idioma guardado y espera a que el JSON esté cargado antes de renderizar.
  provideAppInitializer(() => {
    const transloco = inject(TranslocoService);
    const document = inject(DOCUMENT);
    let lang: string = DEFAULT_LANG;
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) lang = saved;
      } catch {
        /* almacenamiento no disponible */
      }
    }
    transloco.setActiveLang(lang);
    document.documentElement.lang = lang;
    return firstValueFrom(transloco.load(lang));
  }),
];
