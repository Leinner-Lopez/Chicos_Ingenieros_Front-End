import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../Data/Services/category-service';
import { Category } from '../../../Data/Interfaces/Category';
import { RegisterCategory } from "../../../Shared/Modals/register-category/register-category";
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  dialog = inject(Dialog);
  categoryService: CategoryService = inject(CategoryService);
  categories = signal<Category[]>([]);
  categoriesNumber = signal(0);

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories.set(data);
      this.categoriesNumber.set(data.length);
    });
  }

  registerCategory() {
    const dialogRef = this.dialog.open<string>(RegisterCategory, {

    });
    dialogRef.closed.subscribe(result => {
      if (result === 'Categoría registrada') {
        this.getCategories();
      }
    });
  }

  deleteCategory(categoryId: number) {
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        console.log('Categoría eliminada exitosamente');
        this.getCategories();
      }
    })
  }

  updateCategory(categoryId: number) {
    const dialogRef = this.dialog.open<string>(RegisterCategory, {
      data: { categoryId }
    });
    dialogRef.closed.subscribe(result => {
      if (result === 'Categoría registrada') {
        this.getCategories();
      }
    });
  }
}
