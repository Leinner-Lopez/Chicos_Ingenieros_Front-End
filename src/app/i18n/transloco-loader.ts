import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    const load = lang === 'en' ? import('./en.json') : import('./es.json');
    return from(load).pipe(map((m) => (m.default ?? m) as Translation));
  }
}
