import { Component, inject, OnInit, signal } from '@angular/core';
import { SaleService } from '../../../Data/Services/sale-service';
import { SaleHistoryDTO } from '../../../Data/Interfaces/Sale';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-sales-history',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory implements OnInit {
  saleService = inject(SaleService);
  historialVentas = signal<SaleHistoryDTO[]>([]);

  ngOnInit(): void {
    this.saleService.getSaleHistory().subscribe({
      next: (data) => this.historialVentas.set(data),
      error: (err) => console.error(err),
    });
  }
}
