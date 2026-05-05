import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../Data/Services/product-service';
import { Product, } from '../../../Data/Interfaces/Product';
import { CategoryService } from '../../../Data/Services/category-service';
import { Category } from '../../../Data/Interfaces/Category';
import { MessageModal } from '../message-modal/message-modal';

@Component({
  selector: 'app-register-product',
  imports: [ReactiveFormsModule],
  templateUrl: './register-product.html',
  styleUrl: './register-product.css',
})
export class RegisterProduct {
  dialog = inject(Dialog);
  dialogRef: DialogRef<string> = inject(DialogRef);
  categoryService = inject(CategoryService);
  categories: Category[] = []; 
  form = inject(FormBuilder);
  productService: ProductService = inject(ProductService);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    if (data && data.productId) {
      this.productService.findProductById(data.productId).subscribe((product: Product) => {
        this.formularioRegistration.patchValue({
          minStock: product.min_stock,
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.category.category_id,
        });
      });
    }
  }

  formularioRegistration = this.form.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    minStock: [0, [Validators.required]],
    price: [0, [Validators.required]],
    categories: [0, [Validators.required]],
  });

  onSubmit(): void {
    if(this.formularioRegistration.invalid) return;

    const productData: Product ={
      product_id: null!,
      name: this.formularioRegistration.value.name!,
      description: this.formularioRegistration.value.description!,
      price: this.formularioRegistration.value.price!,
      min_stock: this.formularioRegistration.value.minStock!,
      category: {
        category_id: Number(this.formularioRegistration.value.categories!),
      }
    }

    if (this.data && this.data.productId) {
      productData.product_id = this.data.productId;
      this.productService.updateProduct(productData).subscribe({
        next: () => {
          const dialogRef = this.dialog.open<string>(MessageModal, {
            data: {
              title: 'Producto Actualizado',
              message: 'El producto ha sido actualizado exitosamente.',
            },
          });
          setTimeout(() => {
            dialogRef.close();
            this.closeModal();
          }, 1500);
        },
      });
      return;
    }

    this.productService.saveProduct(productData).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data: {
            title: 'Producto Registrado',
            message: 'El producto ha sido registrado exitosamente.',
          },
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      },
    });
  }

  closeModal():void{
    this.dialogRef.close('Producto registrado');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioRegistration.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
