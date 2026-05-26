import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../../Data/Services/product-service';
import { ProductDTO } from '../../../../Data/Interfaces/Product';
import { CurrencyPipe } from '@angular/common';
import { CategoryService } from '../../../../Data/Services/category-service';
import { Category } from '../../../../Data/Interfaces/Category';
import { Dialog } from '@angular/cdk/dialog';
import { BuyProductModal } from '../../../../Shared/Modals/buy-product-modal/buy-product-modal';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsCustomer implements OnInit {
  dialog = inject(Dialog);
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  selectedCategoryId = signal<number>(0);

  catalogProduct = signal<ProductDTO[]>([]);
  categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.loadProducts(0);
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories.set(data);
    });
  }

  loadProducts(categoryId: number): void {
    this.selectedCategoryId.set(categoryId);
    if (categoryId === 0) {
      this.productService.getAllProducts().subscribe((data) => {
        this.catalogProduct.set(data);
      });
    } else {
      this.productService.getProductsByCategory(categoryId).subscribe((data) => {
        this.catalogProduct.set(data);
      });
    }
  }

  registerSale(productId: number): void {
    const dialogRef = this.dialog.open(BuyProductModal, {
      data: { productId },
    });
    dialogRef.closed.subscribe((result) => {
      if (result == 'Sale registered successfully') {
        this.loadProducts(this.selectedCategoryId());
      }
    });
  }
}
