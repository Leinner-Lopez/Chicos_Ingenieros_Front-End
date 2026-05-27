import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LotService } from './lot-service';
import { Lot, LotDTO } from '../Interfaces/Lot';
import { LotStatus } from '../Enum/LotStatus';
import { API_URL } from '../../tokens/api-url.token';
import { environment } from '../../../environments/environment';

describe('LotService', () => {
  let service: LotService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/lots`;

  const mockLot: Lot = {
    lotId: 1,
    expirationDate: '2026-12-31',
    stockQuantity: 100,
    status: LotStatus.AVAILABLE,
    productId: 5,
  };

  const mockLotDTO: LotDTO = {
    lotId: 1,
    expirationDate: '2026-12-31',
    stockQuantity: 100,
    productName: 'Arroz Diana',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LotService,
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    });
    service = TestBed.inject(LotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('saveLot()', () => {
    it('debe crear un nuevo lote (POST)', () => {
      const newLot: Lot = {
        lotId: 0,
        expirationDate: '2026-06-30',
        stockQuantity: 50,
        status: LotStatus.AVAILABLE,
        productId: 3,
      };

      service.saveLot(newLot).subscribe((lot) => {
        expect(lot.lotId).toBe(1);
        expect(lot.stockQuantity).toBe(50);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newLot);
      req.flush({ ...newLot, lotId: 1 });
    });
  });

  describe('getAllLots()', () => {
    it('debe retornar la lista de LotDTO (GET)', () => {
      const mockList: LotDTO[] = [mockLotDTO];

      service.getAllLots().subscribe((lots) => {
        expect(lots.length).toBe(1);
        expect(lots[0].productName).toBe('Arroz Diana');
        expect(lots).toEqual(mockList);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getCountLots()', () => {
    it('debe retornar el total de lotes (GET)', () => {
      service.getCountLots().subscribe((count) => {
        expect(count).toBe(8);
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(8);
    });
  });

  describe('findLotById()', () => {
    it('debe retornar el lote correspondiente al ID (GET)', () => {
      service.findLotById(1).subscribe((lot) => {
        expect(lot.lotId).toBe(1);
        expect(lot.status).toBe(LotStatus.AVAILABLE);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLot);
    });
  });

  describe('updateLot()', () => {
    it('debe actualizar un lote existente (PUT)', () => {
      const updated: Lot = { ...mockLot, stockQuantity: 80 };

      service.updateLot(updated).subscribe((lot) => {
        expect(lot.stockQuantity).toBe(80);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);
    });
  });

  describe('deleteLot()', () => {
    it('debe eliminar el lote por ID (DELETE)', () => {
      service.deleteLot(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
