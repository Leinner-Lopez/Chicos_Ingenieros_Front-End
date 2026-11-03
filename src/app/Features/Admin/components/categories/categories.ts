import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../../Data/Services/category-service';
import { Category } from '../../../../Data/Interfaces/Category';
import { RegisterCategory } from '../../../../Shared/Modals/register-category/register-category';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-categories',
  imports: [TranslocoPipe],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  dialog = inject(Dialog);
  private readonly t = inject(TranslocoService);
  categoryService: CategoryService = inject(CategoryService);
  categories = signal<Category[]>([]);
  categoriesNumber = signal<number>(0);

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories.set(data);
    });
    this.categoryService.getCountCategories().subscribe((data) => {
      this.categoriesNumber.set(data);
    });
  }

  registerCategory() {
    const dialogRef = this.dialog.open<string>(RegisterCategory, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'Categoría registrada') {
        this.getCategories();
      }
    });
  }

  deleteCategory(categoryId: number) {
    const dialogRef = this.dialog.open<string>(ConfirmModal, {
      data: {
        message: this.t.translate('categories.confirmDelete'),
        successTitle: this.t.translate('categories.deleted'),
        successMessage: this.t.translate('categories.deletedMsg'),
        onConfirm: () => this.categoryService.deleteCategory(categoryId),
      },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Eliminación Exitosa') this.getCategories();
    });
  }

  updateCategory(categoryId: number) {
    const dialogRef = this.dialog.open<string>(RegisterCategory, {
      data: { categoryId },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Categoría registrada') {
        this.getCategories();
      }
    });
  }
}
