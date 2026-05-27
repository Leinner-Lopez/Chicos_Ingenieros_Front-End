import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { Lots } from './lots';
import { RegisterLot } from '../Modals/register-lot/register-lot';
import { ConfirmModal } from '../Modals/confirm-modal/confirm-modal';
import { API_URL } from '../../tokens/api-url.token';
import { environment } from '../../../environments/environment';

describe('Lots', () => {
  let component: Lots;
  let fixture: ComponentFixture<Lots>;
  let httpMock: HttpTestingController;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<string | undefined>;

  const lotsUrl = `${environment.apiUrl}/lots`;
  const countUrl = `${environment.apiUrl}/lots/count`;

  const mockLots = [
    { lotId: 1, stockQuantity: 50, productName: 'Arroz Diana', expirationDate: '2027-01-01' },
    { lotId: 2, stockQuantity: 20, productName: 'Leche Entera', expirationDate: '2026-06-01' },
  ];

  beforeEach(async () => {
    dialogClosed = new Subject<string | undefined>();
    mockDialog = { open: vi.fn().mockReturnValue({ closed: dialogClosed.asObservable() }) };

    await TestBed.configureTestingModule({
      imports: [Lots, HttpClientTestingModule],
      providers: [
        { provide: Dialog, useValue: mockDialog },
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Lots);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(lotsUrl).flush(mockLots);
    httpMock.expectOne(countUrl).flush(2);
  });

  afterEach(() => {
    dialogClosed.complete();
    httpMock.verify();
  });

  describe('inicialización', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar los lotes en ngOnInit', () => {
      expect(component.lots().length).toBe(2);
    });

    it('debe cargar el conteo de lotes', () => {
      expect(component.lotsNumber()).toBe(2);
    });
  });

  describe('registerLot()', () => {
    it('debe abrir el modal RegisterLot sin datos', () => {
      component.registerLot();
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterLot, {});
    });

    it('debe recargar la lista cuando el modal cierra con "Lote registrado"', () => {
      const nuevoLote = {
        lotId: 3,
        stockQuantity: 100,
        productName: 'Harina',
        expirationDate: '2027-12-01',
      };
      component.registerLot();
      dialogClosed.next('Lote registrado');
      httpMock.expectOne(lotsUrl).flush([...mockLots, nuevoLote]);
      httpMock.expectOne(countUrl).flush(3);
      expect(component.lots().length).toBe(3);
      expect(component.lotsNumber()).toBe(3);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.registerLot();
      dialogClosed.next('Cancelado');
      httpMock.expectNone(lotsUrl);
    });

    it('no debe recargar si el modal cierra sin resultado', () => {
      component.registerLot();
      dialogClosed.next(undefined);
      httpMock.expectNone(lotsUrl);
    });
  });

  describe('updateLot()', () => {
    it('debe abrir el modal RegisterLot con el lotId correcto', () => {
      component.updateLot(4);
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterLot, { data: { lotId: 4 } });
    });

    it('debe recargar la lista cuando el modal cierra con "Lote actualizado"', () => {
      component.updateLot(1);
      dialogClosed.next('Lote actualizado');
      httpMock.expectOne(lotsUrl).flush(mockLots);
      httpMock.expectOne(countUrl).flush(2);
      expect(component.lots().length).toBe(2);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.updateLot(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(lotsUrl);
    });
  });

  describe('deleteLot()', () => {
    it('debe abrir ConfirmModal con el mensaje y callbacks correctos', () => {
      component.deleteLot(2);
      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmModal, {
        data: expect.objectContaining({
          message: '¿Deseas eliminar este lote?',
          successTitle: 'Lote Eliminado',
          successMessage: 'El lote ha sido eliminado exitosamente.',
          onConfirm: expect.any(Function),
        }),
      });
    });

    it('debe recargar la lista tras eliminación exitosa', () => {
      component.deleteLot(1);
      dialogClosed.next('Eliminación Exitosa');
      httpMock.expectOne(lotsUrl).flush([mockLots[1]]);
      httpMock.expectOne(countUrl).flush(1);
      expect(component.lots().length).toBe(1);
      expect(component.lotsNumber()).toBe(1);
    });

    it('no debe recargar si la eliminación fue cancelada', () => {
      component.deleteLot(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(lotsUrl);
    });
  });

  describe('getLotStatusClass()', () => {
    function isoDate(offsetDays: number): string {
      const d = new Date();
      d.setDate(d.getDate() + offsetDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    it('debe retornar "status-expired" para una fecha en el pasado', () => {
      expect(component.getLotStatusClass(isoDate(-30))).toBe('status-expired');
    });

    it('debe retornar "status-soon" para una fecha dentro de los próximos 7 días', () => {
      expect(component.getLotStatusClass(isoDate(4))).toBe('status-soon');
    });

    it('debe retornar "status-ok" para una fecha con más de 7 días de vigencia', () => {
      expect(component.getLotStatusClass(isoDate(14))).toBe('status-ok');
    });
  });
});
