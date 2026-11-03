import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';

@Injectable({ providedIn: 'root' })
export class DateFormatterService {
  private readonly transloco = inject(TranslocoService);
  private readonly localeService = inject(TranslocoLocaleService);

  /** Se actualiza al cambiar el idioma. */
  private readonly locale = toSignal(this.localeService.localeChanges$, {
    initialValue: this.localeService.getLocale(),
  });

  /** Fecha de hoy formateada en el idioma activo (p. ej. "Lunes, 3 de noviembre" / "Monday, November 3"). */
  readonly fechaHoy = computed(() => this.format(new Date(), this.locale()));

  getFechaFormateada(fecha: Date = new Date()): string {
    return this.format(fecha, this.localeService.getLocale());
  }

  private format(fecha: Date, locale: string): string {
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(fecha);
    const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(fecha);
    return this.transloco.translate('date.dayMonth', {
      weekday: weekday.charAt(0).toLocaleUpperCase(locale) + weekday.slice(1),
      day: fecha.getDate(),
      month,
    });
  }
}
