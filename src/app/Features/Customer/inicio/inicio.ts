import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../../Data/Services/Dashboard/customer.service';
import { AuthService } from '../../../Core/Services/auth-service';
import { SaleHistoryDTO } from '../../../Data/Interfaces/Sale';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioCustomer implements OnInit {
  availableProducts = signal<number>(0);
  totalPurchases = signal<number>(0);
  totalSpent = signal<number>(0);
  recentPurchases = signal<SaleHistoryDTO[]>([]);

  customerService = inject(CustomerService);
  authService = inject(AuthService);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.customerService.getAvailableProducts().subscribe((data) => this.availableProducts.set(data));
    this.customerService.getTotalPurchases(userId).subscribe((data) => this.totalPurchases.set(data));
    this.customerService.getTotalSpent(userId).subscribe((data) => this.totalSpent.set(data));
    this.customerService.getRecentPurchases(userId).subscribe((data) => this.recentPurchases.set(data));
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
