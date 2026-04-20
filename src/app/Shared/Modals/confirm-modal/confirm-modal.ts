import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { CategoryService } from '../../../Data/Services/category-service';
import { MessageModal } from '../message-modal/message-modal';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  dialog = inject(Dialog);
  categoryService: CategoryService = inject(CategoryService);
  dialogRef: DialogRef<string> = inject(DialogRef);
  title: string = '';
  message: string = '';
  id: number = 0;

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data) {
      this.title = data.title || '';
      this.message = data.message || '';
      this.id = data.categoryId || 0;
    }
  }



  closeModal() {
    this.dialogRef.close('Categoría Eliminada');
  }


  confirmAction() {
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

}
