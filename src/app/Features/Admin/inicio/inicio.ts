import { Component, inject, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { AdminService } from '../../../Data/Services/Dashboard/admin.service';
import { LotDTO } from '../../../Data/Interfaces/Lot';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inicio-admin',
  imports: [DatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioAdmin implements OnInit {
  productsWithLowStock = signal<number>(0);
  lots = signal<LotDTO[]>([]);
  costOfShrinksOfTheMonth = signal<number>(0);

  dashboardAdminService = inject(AdminService);

  ngOnInit(): void {
    this.dashboardAdminService.getProductsWithLowStock().subscribe((data: number) => {
      this.productsWithLowStock.set(data);
    });
    this.dashboardAdminService.getLotsExpireThisWeek().subscribe((data: LotDTO[]) => {
      this.lots.set(data);
    });
    this.dashboardAdminService.getCostOfShrinksOfTheMonth().subscribe((data: number) => {
      this.costOfShrinksOfTheMonth.set(data);
    });
  }

  filtroActual = signal<'Pendientes' | 'Completadas'>('Pendientes');

  cambiarFiltro(nuevoFiltro: 'Pendientes' | 'Completadas'): void {
    if (this.filtroActual() === nuevoFiltro) return;
    this.filtroActual.set(nuevoFiltro);
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
