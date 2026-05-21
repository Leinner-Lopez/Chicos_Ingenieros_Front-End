import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../Data/Services/product-service';
import { ProductInventoryDTO } from '../../../Data/Interfaces/Product';

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory {
  inventory = signal<ProductInventoryDTO[]>([]);
  productService = inject(ProductService);
  productCount = signal<number>(0);

  ngOnInit(): void {
    this.productService.getInventory().subscribe((data) => {
      this.inventory.set(data);
    });

    this.productService.getCountProducts().subscribe((count) => {
      this.productCount.set(count);
    });
  }
}
