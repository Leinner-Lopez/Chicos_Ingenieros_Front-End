import { Category } from './Category';

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  min_stock: number;
  category: Category;
}

export interface ProductDTO {
  product_id: number;
  name: string;
  categoryName: string;
  price: number;
  description: string;
}
