import { Component, inject, OnInit, signal } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { LotDTO } from '../../../../Data/Interfaces/Lot';
import { DateFormatterService } from '../../../../Core/Services/date-formatter.service';
import { LotExpirationList } from '../../../../Shared/lot-expiration-list/lot-expiration-list';

@Component({
  selector: 'app-inicio',
  imports: [LotExpirationList],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioStore implements OnInit {
  lots = signal<LotDTO[]>([]);
  totalLots = signal<number>(0);
  lossesOfTheMonth = signal<number>(0);

  private readonly storeService = inject(StoreService);
  private readonly dateFormatter = inject(DateFormatterService);

  fechaFormateada = this.dateFormatter.getFechaFormateada();

  ngOnInit(): void {
    this.storeService.getLotsExpireThisWeek().subscribe((data) => this.lots.set(data));
    this.storeService.getTotalLots().subscribe((data) => this.totalLots.set(data));
    this.storeService.getLossesOfTheMonth().subscribe((data) => this.lossesOfTheMonth.set(data));
  }
}
