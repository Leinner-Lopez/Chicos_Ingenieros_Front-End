import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { LotDTO } from '../../../../Data/Interfaces/Lot';
import { DateFormatterService } from '../../../../Core/Services/date-formatter.service';
import { LotExpirationList } from '../../../../Shared/lot-expiration-list/lot-expiration-list';

@Component({
  selector: 'app-inicio-admin',
  imports: [LotExpirationList],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioAdmin implements OnInit {
  productsWithLowStock = signal<number>(0);
  lots = signal<LotDTO[]>([]);
  costOfShrinksOfTheMonth = signal<number>(0);

  private readonly dashboardAdminService = inject(AdminService);
  private readonly dateFormatter = inject(DateFormatterService);

  fechaFormateada = this.dateFormatter.getFechaFormateada();

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
}
