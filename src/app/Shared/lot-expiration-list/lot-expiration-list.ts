import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import { LotDTO } from '../../Data/Interfaces/Lot';

@Component({
  selector: 'app-lot-expiration-list',
  imports: [TranslocoPipe, TranslocoDatePipe],
  templateUrl: './lot-expiration-list.html',
  styleUrl: '../../Features/Admin/components/inicio/inicio.css',
})
export class LotExpirationList {
  lots = input<LotDTO[]>([]);
  fecha = input<string>('');
  title = input<string>('');
}
