import { LotStatus } from '../Enum/LotStatus';

export interface Lot {
  lotId: number;
  expirationDate: string;
  stockQuantity: number;
  status: LotStatus;
  productId: number;
}

export interface LotDTO {
  lotId: number;
  expirationDate: string;
  stockQuantity: number;
  productName: string;
}
