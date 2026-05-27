import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LotDTO } from '../../Data/Interfaces/Lot';

@Component({
  selector: 'app-lot-expiration-list',
  imports: [DatePipe],
  templateUrl: './lot-expiration-list.html',
  styleUrl: '../../Features/Admin/components/inicio/inicio.css',
})
export class LotExpirationList {
  lots = input<LotDTO[]>([]);
  fecha = input<string>('');
  title = input<string>('Lotes por vencer esta semana');
}
