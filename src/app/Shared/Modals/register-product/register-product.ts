import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../Data/Services/product-service';
import { ProductResponse } from '../../../Data/Interfaces/Product';
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
  selectedImage: File | null = null;

  constructor(@Inject(DIALOG_DATA) public data: any) {
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    if (data?.productId) {
      this.productService.findProductById(data.productId).subscribe((product: ProductResponse) => {
        this.formularioRegistration.patchValue({
          minStock: product.minStock,
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.categoryId,
        });
        this.formularioRegistration.get('image')?.clearValidators();
        this.formularioRegistration.get('image')?.updateValueAndValidity();
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
    if (this.formularioRegistration.invalid) return;

    const formData: FormData = new FormData();

    const productData: ProductResponse = {
      productId: null!,
      name: this.formularioRegistration.value.name!,
      description: this.formularioRegistration.value.description!,
      price: this.formularioRegistration.value.price!,
      minStock: this.formularioRegistration.value.minStock!,
      categoryId: Number(this.formularioRegistration.value.categories!),
    };

    if (this.data?.productId) {
      productData.productId = this.data.productId;
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

    formData.append('data', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    formData.append('image', this.selectedImage as File);

    this.productService.saveProduct(formData).subscribe({
      next: (response) => {
        console.log(response);
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

  closeModal(): void {
    this.dialogRef.close('Producto registrado');
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioRegistration.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
