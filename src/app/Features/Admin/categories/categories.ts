import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../Data/Services/category-service';
import { Category } from '../../../Data/Interfaces/Category';

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categoryService: CategoryService = inject(CategoryService);
  categories:Category[] = [];
  categoriesNumber = signal(0);

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories = data;
      this.categoriesNumber.set(data.length);
      console.log(this.categories);
    });
  }

}
