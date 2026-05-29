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
  isEditMode: boolean;
  currentImageUrl: string | null = null;
  imageError: string | null = null;
  readonly ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  readonly MAX_SIZE_MB = 10;

  constructor(@Inject(DIALOG_DATA) public data: any) {
    this.isEditMode = !!data?.productId;
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    if (this.isEditMode) {
      this.productService.findProductById(data.productId).subscribe((product: ProductResponse) => {
        this.currentImageUrl = product.imageUrl;
        this.formularioRegistration.patchValue({
          minStock: product.minStock,
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.categoryId,
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
    if (this.formularioRegistration.invalid || this.imageError) return;

    const formData: FormData = new FormData();

    const productData: ProductResponse = {
      productId: null!,
      name: this.formularioRegistration.value.name!,
      description: this.formularioRegistration.value.description!,
      price: this.formularioRegistration.value.price!,
      minStock: this.formularioRegistration.value.minStock!,
      categoryId: Number(this.formularioRegistration.value.categories!),
      imageUrl: '',
    };

    formData.append('data', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    if (this.data?.productId) {
      productData.productId = this.data.productId;
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }
      this.productService.updateProduct(formData).subscribe({
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
    this.imageError = null;
    this.selectedImage = null;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      this.imageError = 'Formato no permitido. Solo se aceptan JPG, PNG y WebP.';
      input.value = '';
      return;
    }

    if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
      this.imageError = `La imagen no puede superar los ${this.MAX_SIZE_MB} MB.`;
      input.value = '';
      return;
    }

    this.selectedImage = file;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioRegistration.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
