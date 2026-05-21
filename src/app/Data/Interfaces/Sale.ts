export interface SaleHistoryDTO {
  saleId: number;
  saleDate: string;
  productName: string;
  lotId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleRequest {
  productId: number;
  quantity: number;
  userId: number;
}

export interface SaleResponse {
  saleId: number;
  userId: number;
  saleDate: string;
  totalPrice: number;
}
