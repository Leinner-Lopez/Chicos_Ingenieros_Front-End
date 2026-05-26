import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../Core/Services/auth-service';
import { SaleRequest } from '../../../Data/Interfaces/Sale';
import { SaleService } from '../../../Data/Services/sale-service';
import { MessageModal } from '../message-modal/message-modal';

@Component({
  selector: 'app-buy-product-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './buy-product-modal.html',
  styleUrl: './buy-product-modal.css',
})
export class BuyProductModal {
  dialog = inject(Dialog);
  dialogRef: DialogRef<string> = inject(DialogRef);
  form = inject(FormBuilder);
  authService = inject(AuthService);
  salesService = inject(SaleService);
  productId = signal<number | null>(null);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data?.productId) {
      this.productId.set(data.productId);
    }
  }

  salesForm = this.form.group({
    quantity: ['', [Validators.required]],
  });

  closeModal() {
    this.dialogRef.close('Sale registered successfully');
  }

  onSubmit() {
    if (this.salesForm.invalid) return;

    const data: SaleRequest = {
      productId: this.productId()!,
      quantity: Number(this.salesForm.value.quantity!),
      userId: this.authService.getUserId()!,
    };

    this.salesService.saveSale(data).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data: {
            title: 'Compra Registrada',
            message: 'La compra ha sido registrada exitosamente.',
          },
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      },
      error: (err) => console.error(err),
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.salesForm.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
