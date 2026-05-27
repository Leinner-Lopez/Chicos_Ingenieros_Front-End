import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../Data/Services/category-service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Category } from '../../../Data/Interfaces/Category';
import { ModalNotificationService } from '../../../Core/Services/modal-notification.service';
import { hasFormError } from '../../Utilities/form-utils';

@Component({
  selector: 'app-register-category',
  imports: [ReactiveFormsModule],
  templateUrl: './register-category.html',
  styleUrl: './register-category.css',
})
export class RegisterCategory {
  private readonly dialogRef: DialogRef<string> = inject(DialogRef);
  private readonly form = inject(FormBuilder);
  private readonly categoryService: CategoryService = inject(CategoryService);
  private readonly modalNotification = inject(ModalNotificationService);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data?.categoryId) {
      this.categoryService.findCategoryById(data.categoryId).subscribe((category) => {
        this.formularioRegistration.patchValue({
          name: category.name,
          description: category.description,
        });
      });
    }
  }

  formularioRegistration = this.form.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.formularioRegistration.invalid) return;

    const categoryData: Category = {
      categoryId: null!,
      name: this.formularioRegistration.value.name!,
      description: this.formularioRegistration.value.description!,
    };

    if (this.data?.categoryId) {
      categoryData.categoryId = this.data.categoryId;
      this.categoryService.updateCategory(categoryData).subscribe({
        next: () => {
          console.log('Categoría actualizada exitosamente');
          this.closeModal();
        },
      });
      return;
    }

    this.categoryService.saveCategory(categoryData).subscribe({
      next: () =>
        this.modalNotification.showSuccess(
          'Categoría Registrada',
          'La categoría ha sido registrada exitosamente.',
          () => this.closeModal(),
        ),
    });
  }

  closeModal() {
    this.dialogRef.close('Categoría registrada');
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasFormError(this.formularioRegistration, controlName, errorType);
  }
}
