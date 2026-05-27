import { Component, inject, Inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LotService } from '../../../Data/Services/lot-service';
import { LotStatus } from '../../../Data/Enum/LotStatus';
import { Lot } from '../../../Data/Interfaces/Lot';
import { ProductService } from '../../../Data/Services/product-service';
import { ProductDTO } from '../../../Data/Interfaces/Product';
import { ModalNotificationService } from '../../../Core/Services/modal-notification.service';
import { hasFormError } from '../../Utilities/form-utils';

@Component({
  selector: 'app-register-lot',
  imports: [ReactiveFormsModule],
  templateUrl: './register-lot.html',
  styleUrl: './register-lot.css',
})
export class RegisterLot {
  private readonly dialogRef: DialogRef<string> = inject(DialogRef);
  private readonly form = inject(FormBuilder);
  private readonly lotService: LotService = inject(LotService);
  private readonly productService: ProductService = inject(ProductService);
  private readonly modalNotification = inject(ModalNotificationService);
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
    expirationDate: [
      '',
      [
        Validators.required,
        (control: { value: string }) => {
          if (!control.value) return null;
          return control.value < new Date().toLocaleDateString('en-CA') ? { minDate: true } : null;
        },
      ],
    ],
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
      next: () =>
        this.modalNotification.showSuccess(
          'Lote Registrado',
          'El lote ha sido registrado exitosamente.',
          () => this.closeModal(),
        ),
    });
  }

  closeModal() {
    this.dialogRef.close('Lote registrado');
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasFormError(this.formularioRegistration, controlName, errorType);
  }
}
