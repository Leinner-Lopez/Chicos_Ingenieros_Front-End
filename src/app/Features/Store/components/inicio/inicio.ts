import { Component, inject, OnInit, signal } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { LotDTO } from '../../../../Data/Interfaces/Lot';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [DatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioStore implements OnInit {
  lots = signal<LotDTO[]>([]);
  totalLots = signal<number>(0);
  lossesOfTheMonth = signal<number>(0);

  storeService = inject(StoreService);

  ngOnInit(): void {
    this.storeService.getLotsExpireThisWeek().subscribe((data) => this.lots.set(data));
    this.storeService.getTotalLots().subscribe((data) => this.totalLots.set(data));
    this.storeService.getLossesOfTheMonth().subscribe((data) => this.lossesOfTheMonth.set(data));
  }

  díasSemana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  fechaFormateada = this.getFechaFormateada();

  getFechaFormateada(): string {
    const fecha: Date = new Date();
    const diaSemana: string = this.díasSemana[fecha.getDay()];
    const dia: number = fecha.getDate();
    const mes: string = fecha.toLocaleDateString('es-ES', { month: 'long' });
    return `${diaSemana}, ${dia} de ${mes}`;
  }
}
