import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SaleService } from './sale-service';
import { SaleHistoryDTO, SaleRequest, SaleResponse } from '../Interfaces/Sale';
import { environment } from '../../../environments/environment';

describe('SaleService', () => {
  let service: SaleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/sales`;

  const mockSaleResponse: SaleResponse = {
    saleId: 1,
    userId: 10,
    saleDate: '2026-05-24T10:30:00',
    totalPrice: 7000,
  };

  const mockSaleHistory: SaleHistoryDTO[] = [
    {
      saleId: 1,
      saleDate: '2026-05-24T10:30:00',
      productName: 'Arroz Diana',
      lotId: 3,
      quantity: 2,
      unitPrice: 3500,
      totalPrice: 7000,
    },
    {
      saleId: 2,
      saleDate: '2026-05-23T15:00:00',
      productName: 'Leche Entera',
      lotId: 5,
      quantity: 1,
      unitPrice: 4200,
      totalPrice: 4200,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SaleService],
    });
    service = TestBed.inject(SaleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('saveSale()', () => {
    it('debe registrar una venta y retornar la respuesta (POST)', () => {
      const saleRequest: SaleRequest = { productId: 1, quantity: 2, userId: 10 };

      service.saveSale(saleRequest).subscribe((sale) => {
        expect(sale.saleId).toBe(1);
        expect(sale.totalPrice).toBe(7000);
        expect(sale.userId).toBe(10);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(saleRequest);
      req.flush(mockSaleResponse);
    });
  });

  describe('getSales()', () => {
    it('debe retornar la lista de ventas (GET)', () => {
      const mockList: SaleResponse[] = [mockSaleResponse];

      service.getSales().subscribe((sales) => {
        expect(sales.length).toBe(1);
        expect(sales[0].saleId).toBe(1);
        expect(sales).toEqual(mockList);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getSaleHistory()', () => {
    it('debe retornar el historial completo de ventas con detalle (GET)', () => {
      service.getSaleHistory().subscribe((history) => {
        expect(history.length).toBe(2);
        expect(history[0].productName).toBe('Arroz Diana');
        expect(history[1].unitPrice).toBe(4200);
      });

      const req = httpMock.expectOne(`${apiUrl}/history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSaleHistory);
    });
  });
});
