import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { MessageModal } from '../message-modal/message-modal';
import { Observable } from 'rxjs';

interface ConfirmModalData {
  message: string;
  successTitle: string;
  successMessage: string;
  onConfirm: () => Observable<unknown>;
}

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  dialog = inject(Dialog);
  dialogRef: DialogRef<string> = inject(DialogRef);
  message: string;

  constructor(@Inject(DIALOG_DATA) public data: ConfirmModalData) {
    this.message = data.message;
  }

  closeModal() {
    this.dialogRef.close('Eliminación Exitosa');
  }

  confirmAction() {
    this.data.onConfirm().subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data: { title: this.data.successTitle, message: this.data.successMessage },
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      },
    });
  }
}
