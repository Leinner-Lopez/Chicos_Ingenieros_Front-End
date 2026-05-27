import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { LotDTO } from '../../../Data/Interfaces/Lot';
import { environment } from '../../../../environments/environment';
import { API_URL } from '../../../tokens/api-url.token';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/dashboard/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminService,
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getLotsExpireThisWeek()', () => {
    it('debe retornar los lotes próximos a vencer esta semana (GET)', () => {
      const mockLots: LotDTO[] = [
        { lotId: 2, expirationDate: '2026-05-26', stockQuantity: 30, productName: 'Leche Entera' },
        { lotId: 7, expirationDate: '2026-05-27', stockQuantity: 10, productName: 'Yogur Natural' },
      ];

      service.getLotsExpireThisWeek().subscribe((lots) => {
        expect(lots.length).toBe(2);
        expect(lots[0].productName).toBe('Leche Entera');
        expect(lots[1].lotId).toBe(7);
      });

      const req = httpMock.expectOne(`${apiUrl}/lots_expire`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLots);
    });

    it('debe retornar lista vacía cuando no hay lotes próximos a vencer', () => {
      service.getLotsExpireThisWeek().subscribe((lots) => {
        expect(lots.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/lots_expire`);
      req.flush([]);
    });
  });

  describe('getProductsWithLowStock()', () => {
    it('debe retornar el número de productos con stock crítico (GET)', () => {
      service.getProductsWithLowStock().subscribe((count) => {
        expect(count).toBe(4);
      });

      const req = httpMock.expectOne(`${apiUrl}/critical_products`);
      expect(req.request.method).toBe('GET');
      req.flush(4);
    });

    it('debe retornar 0 cuando todos los productos tienen stock suficiente', () => {
      service.getProductsWithLowStock().subscribe((count) => {
        expect(count).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/critical_products`);
      req.flush(0);
    });
  });

  describe('getCostOfShrinksOfTheMonth()', () => {
    it('debe retornar el costo total de mermas del mes (GET)', () => {
      service.getCostOfShrinksOfTheMonth().subscribe((cost) => {
        expect(cost).toBe(125000);
      });

      const req = httpMock.expectOne(`${apiUrl}/losses_month`);
      expect(req.request.method).toBe('GET');
      req.flush(125000);
    });

    it('debe retornar 0 cuando no hubo mermas en el mes', () => {
      service.getCostOfShrinksOfTheMonth().subscribe((cost) => {
        expect(cost).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/losses_month`);
      req.flush(0);
    });
  });
});
