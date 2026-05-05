import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../Data/Services/product-service';
import { ProductDTO } from '../../../Data/Interfaces/Product';
import { Dialog } from '@angular/cdk/dialog';
import { RegisterProduct } from '../../../Shared/Modals/register-product/register-product';
import { ConfirmModal } from '../../../Shared/Modals/confirm-modal/confirm-modal';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  dialog = inject(Dialog);
  productService: ProductService = inject(ProductService);
  products = signal<ProductDTO[]>([]);
  productNumber = signal<number>(0);

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this.products.set(data);
    });
    this.productService.getCountProducts().subscribe((count) => {
      this.productNumber.set(count);
    });
  }

  registerProduct(): void {
    const dialogRef = this.dialog.open(RegisterProduct, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'Producto registrado') {
        this.getProducts();
      }
    });
  }

  updateProduct(productId: number): void {
    const dialogRef = this.dialog.open(RegisterProduct, {
      data: { productId },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Producto registrado') {
        this.getProducts();
      }
    });
  }

  deleteProduct(productId: number): void {
    const dialogRef = this.dialog.open<string>(ConfirmModal, {
      data: {
        entity: 'product',
        message: '¿Deseas eliminar este producto?',
        Id: productId,
      },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Eliminación Exitosa') {
        this.getProducts();
      }
    });
  }
}
