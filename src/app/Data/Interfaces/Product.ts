export interface ProductRequest {
  productId: number;
  name: string;
  description: string;
  price: number;
  minStock: number;
  categoryId: number;
  imageUrl: string;
}

export interface ProductResponse {
  productId: number;
  name: string;
  description: string;
  price: number;
  minStock: number;
  categoryId: number;
}

export interface ProductDTO {
  productId: number;
  name: string;
  categoryName: string;
  price: number;
  imageUrl: string;
}
