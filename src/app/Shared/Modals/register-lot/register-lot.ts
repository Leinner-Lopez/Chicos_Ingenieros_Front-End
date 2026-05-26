import { Component, inject, Inject, signal } from '@angular/core';
import { MessageModal } from '../message-modal/message-modal';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LotService } from '../../../Data/Services/lot-service';
import { LotStatus } from '../../../Data/Enum/LotStatus';
import { Lot } from '../../../Data/Interfaces/Lot';
import { ProductService } from '../../../Data/Services/product-service';
import { ProductDTO } from '../../../Data/Interfaces/Product';

@Component({
  selector: 'app-register-lot',
  imports: [ReactiveFormsModule],
  templateUrl: './register-lot.html',
  styleUrl: './register-lot.css',
})
export class RegisterLot {
  dialog = inject(Dialog);
  dialogRef: DialogRef<string> = inject(DialogRef);
  form = inject(FormBuilder);
  lotService: LotService = inject(LotService);
  productService: ProductService = inject(ProductService);
  products = signal<ProductDTO[]>([]);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    this.productService.getAllProducts().subscribe((products) => {
      this.products.set(products);
    });
    if (data?.lotId) {
      this.lotService.findLotById(data.lotId).subscribe((lot) => {
        this.formularioRegistration.patchValue({
          stock: lot.stockQuantity,
          product: lot.productId,
          status: lot.status,
          expirationDate: lot.expirationDate,
        });
      });
    }
  }

  today = new Date().toLocaleDateString('en-CA');

  formularioRegistration = this.form.group({
    stock: [0, [Validators.required]],
    product: [0, [Validators.required]],
    status: [LotStatus.AVAILABLE, [Validators.required]],
    expirationDate: ['', [Validators.required, (control: { value: string }) => {
      if (!control.value) return null;
      return control.value < new Date().toLocaleDateString('en-CA') ? { minDate: true } : null;
    }]],
  });

  onSubmit() {
    if (this.formularioRegistration.invalid) return;

    const lotData: Lot = {
      lotId: null!,
      stockQuantity: this.formularioRegistration.value.stock!,
      productId: Number(this.formularioRegistration.value.product!),
      status: this.formularioRegistration.value.status!,
      expirationDate: this.formularioRegistration.value.expirationDate!,
    };

    console.log(lotData);

    if (this.data?.lotId) {
      lotData.lotId = this.data.lotId;
      this.lotService.updateLot(lotData).subscribe({
        next: () => {
          console.log('Lote actualizado exitosamente');
          this.closeModal();
        },
      });
      return;
    }

    this.lotService.saveLot(lotData).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data: {
            title: 'Lote Registrado',
            message: 'El lote ha sido registrado exitosamente.',
          },
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      },
    });
  }

  closeModal() {
    this.dialogRef.close('Lote registrado');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioRegistration.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
