import { TranslocoPipe } from '@jsverse/transloco';
import { TranslocoDatePipe, TranslocoDecimalPipe } from '@jsverse/transloco-locale';
import { DateFormatterService } from '../../../../Core/Services/date-formatter.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../../../Core/Services/auth-service';
import { SaleHistoryDTO } from '../../../../Data/Interfaces/Sale';

@Component({
  selector: 'app-inicio',
  imports: [TranslocoPipe, TranslocoDatePipe, TranslocoDecimalPipe],
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
  private readonly dateFormatter = inject(DateFormatterService);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.customerService
      .getAvailableProducts()
      .subscribe((data) => this.availableProducts.set(data));
    this.customerService
      .getTotalPurchases(userId)
      .subscribe((data) => this.totalPurchases.set(data));
    this.customerService.getTotalSpent(userId).subscribe((data) => this.totalSpent.set(data));
    this.customerService
      .getRecentPurchases(userId)
      .subscribe((data) => this.recentPurchases.set(data));
  }

  fechaFormateada = this.dateFormatter.fechaHoy;
}
