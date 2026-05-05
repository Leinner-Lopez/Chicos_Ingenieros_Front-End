import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { CategoryService } from '../../../Data/Services/category-service';
import { MessageModal } from '../message-modal/message-modal';
import { ProductService } from '../../../Data/Services/product-service';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  dialog = inject(Dialog);
  productService: ProductService = inject(ProductService);
  categoryService: CategoryService = inject(CategoryService);
  dialogRef: DialogRef<string> = inject(DialogRef);
  message: string = '';
  entity:string = '';
  id: number = 0;

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data) {
      this.entity = data.entity || '';
      this.message = data.message || '';
      this.id = data.Id || 0;
    }
  }



  closeModal() {
    this.dialogRef.close('Eliminación Exitosa');
  }


  confirmAction() {
    switch (this.entity) {
      case 'category':
        this.deleteCategory();
        break;
      case 'product':
        this.deleteProduct();
        break;
      default:
        console.warn('Entidad no reconocida para eliminación');
        break;
    }
  }

  deleteCategory() {
    this.categoryService.deleteCategory(this.id).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data:{
            title: 'Categoría Eliminada',
            message: 'La categoría ha sido eliminada exitosamente.'
          }
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      }
    })
  }

  deleteProduct() {
    this.productService.deleteProduct(this.id).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data:{
            title: 'Producto Eliminado',
            message: 'El producto ha sido eliminado exitosamente.'
          }
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      }
    })
  }

}
