import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StoreService } from './store.service';
import { API_URL } from '../../../tokens/api-url.token';
import { LotDTO } from '../../../Data/Interfaces/Lot';
import { environment } from '../../../../environments/environment';

describe('StoreService', () => {
  let service: StoreService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/dashboard/store`;

  const mockLots: LotDTO[] = [
    { lotId: 1, stockQuantity: 10, productName: 'Arroz Diana', expirationDate: '2026-05-30' },
    { lotId: 2, stockQuantity: 5, productName: 'Leche Entera', expirationDate: '2026-05-29' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StoreService,
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    });
    service = TestBed.inject(StoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getLotsExpireThisWeek()', () => {
    it('debe retornar los lotes que vencen esta semana (GET)', () => {
      service.getLotsExpireThisWeek().subscribe((lots) => {
        expect(lots.length).toBe(2);
        expect(lots).toEqual(mockLots);
      });

      const req = httpMock.expectOne(`${baseUrl}/lots_expire`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLots);
    });

    it('debe retornar lista vacía cuando no hay lotes por vencer', () => {
      service.getLotsExpireThisWeek().subscribe((lots) => {
        expect(lots).toEqual([]);
      });

      httpMock.expectOne(`${baseUrl}/lots_expire`).flush([]);
    });
  });

  describe('getTotalLots()', () => {
    it('debe retornar el total de lotes (GET)', () => {
      service.getTotalLots().subscribe((total) => {
        expect(total).toBe(42);
      });

      const req = httpMock.expectOne(`${baseUrl}/total_lots`);
      expect(req.request.method).toBe('GET');
      req.flush(42);
    });

    it('debe retornar 0 cuando no hay lotes registrados', () => {
      service.getTotalLots().subscribe((total) => {
        expect(total).toBe(0);
      });

      httpMock.expectOne(`${baseUrl}/total_lots`).flush(0);
    });
  });

  describe('getLossesOfTheMonth()', () => {
    it('debe retornar las pérdidas del mes (GET)', () => {
      service.getLossesOfTheMonth().subscribe((losses) => {
        expect(losses).toBe(1500);
      });

      const req = httpMock.expectOne(`${baseUrl}/losses_month`);
      expect(req.request.method).toBe('GET');
      req.flush(1500);
    });

    it('debe retornar 0 cuando no hubo pérdidas en el mes', () => {
      service.getLossesOfTheMonth().subscribe((losses) => {
        expect(losses).toBe(0);
      });

      httpMock.expectOne(`${baseUrl}/losses_month`).flush(0);
    });
  });
});
