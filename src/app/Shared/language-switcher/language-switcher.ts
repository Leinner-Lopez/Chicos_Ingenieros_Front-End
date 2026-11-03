import { Component, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppLang, LANG_STORAGE_KEY, SUPPORTED_LANGS } from '../../i18n/language';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly langs = SUPPORTED_LANGS;
  readonly active = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  setLang(lang: AppLang): void {
    if (lang === this.active()) return;
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
    if (this.isBrowser) {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {
        /* almacenamiento no disponible */
      }
    }
  }
}
