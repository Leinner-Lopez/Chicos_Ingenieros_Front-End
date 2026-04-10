import { Component, Inject, inject, model } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../Data/Services/category-service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Category } from '../../../Data/Interfaces/Category';

@Component({
  selector: 'app-register-category',
  imports: [ReactiveFormsModule],
  templateUrl: './register-category.html',
  styleUrl: './register-category.css',
})
export class RegisterCategory {

  dialogRef: DialogRef<string> = inject(DialogRef);
  form = inject(FormBuilder);
  categoryService: CategoryService = inject(CategoryService);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data && data.categoryId) {
      this.categoryService.findCategoryById(data.categoryId).subscribe(category => {
        this.formularioRegistration.patchValue({
          name: category.name,
          description: category.description
        });
      });
    }

  }

  formularioRegistration = this.form.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  })

  onSubmit() {
    if (this.formularioRegistration.invalid) return;

    const categoryData: Category = {
      category_id: null!,
      name: this.formularioRegistration.value.name!,
      description: this.formularioRegistration.value.description!
    }

    if (this.data && this.data.categoryId) {
      categoryData.category_id = this.data.categoryId;
      this.categoryService.updateCategory(categoryData).subscribe({
        next: () => {
          console.log('Categoría actualizada exitosamente');
          this.closeModal();
        }
      });
      return;
    }

    this.categoryService.saveCategory(categoryData).subscribe({
      next: () => {
        console.log('Categoría registrada exitosamente');
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.dialogRef.close('Categoría registrada');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioRegistration.get(controlName);
    return control?.hasError(errorType) && (control.dirty || control.touched) || false;
  }
}
