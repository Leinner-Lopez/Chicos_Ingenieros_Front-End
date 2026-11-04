import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import es from './app/i18n/es.json';
import en from './app/i18n/en.json';
import { LANG_TO_LOCALE } from './app/i18n/language';

/**
 * Todos los specs arrancan con Transloco en español y con los JSON reales,
 * así los componentes que inyectan TranslocoService o usan los pipes funcionan sin configuración extra.
 */
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { es, en },
        translocoConfig: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        preloadLangs: true,
      }),
    ],
    providers: [provideTranslocoLocale({ langToLocaleMapping: LANG_TO_LOCALE, defaultCurrency: 'COP' })],
  });
});
