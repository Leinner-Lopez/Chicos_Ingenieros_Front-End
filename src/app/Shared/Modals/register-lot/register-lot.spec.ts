import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { RegisterLot } from './register-lot';
import { LotStatus } from '../../../Data/Enum/LotStatus';
import { environment } from '../../../../environments/environment';

describe('RegisterLot', () => {
  let component: RegisterLot;
  let fixture: ComponentFixture<RegisterLot>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  const lotsUrl = `${environment.apiUrl}/lots`;
  const productsUrl = `${environment.apiUrl}/products`;

  const mockProducts = [
    { productId: 1, name: 'Arroz Diana', categoryName: 'Granos', price: 3500, imageUrl: '', description: '', totalStock: 50 },
    { productId: 2, name: 'Leche Entera', categoryName: 'Lácteos', price: 4200, imageUrl: '', description: '', totalStock: 20 },
  ];

  const validFormValue = {
    stock: 100,
    product: 1,
    status: LotStatus.AVAILABLE,
    expirationDate: '2027-01-01',
  };

  describe('modo creación (sin lotId)', () => {
    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterLot, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: {} },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterLot);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      // Constructor siempre llama a getAllProducts()
      httpMock.expectOne(productsUrl).flush(mockProducts);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar la lista de productos al inicializar', () => {
      expect(component.products().length).toBe(2);
      expect(component.products()[0].name).toBe('Arroz Diana');
    });

    it('formulario debe inicializarse con status AVAILABLE', () => {
      expect(component.formularioRegistration.get('status')!.value).toBe(LotStatus.AVAILABLE);
    });

    it('formulario inválido si la fecha de vencimiento está vacía', () => {
      component.formularioRegistration.patchValue({ stock: 50, product: 1, expirationDate: '' });
      expect(component.formularioRegistration.invalid).toBe(true);
    });

    it('formulario válido con todos los campos completos', () => {
      component.formularioRegistration.setValue(validFormValue);
      expect(component.formularioRegistration.valid).toBe(true);
    });

    it('onSubmit() con formulario inválido no debe realizar petición HTTP', () => {
      component.onSubmit();
      httpMock.expectNone(lotsUrl);
    });

    it('onSubmit() con formulario válido debe llamar a saveLot() (POST)', () => {
      component.formularioRegistration.setValue(validFormValue);

      component.onSubmit();

      const req = httpMock.expectOne(lotsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.stockQuantity).toBe(100);
      expect(req.request.body.productId).toBe(1);
      expect(req.request.body.expirationDate).toBe('2027-01-01');
      req.flush({ lotId: 10, ...validFormValue });
    });

    it('closeModal() debe cerrar el diálogo con "Lote registrado"', () => {
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('Lote registrado');
    });

    it('hasError() debe retornar true para campo requerido tocado y vacío', () => {
      component.formularioRegistration.get('expirationDate')!.markAsTouched();
      component.formularioRegistration.get('expirationDate')!.setValue('');
      expect(component.hasError('expirationDate', 'required')).toBe(true);
    });
  });

  describe('modo edición (con lotId)', () => {
    const mockLot = {
      lotId: 4,
      stockQuantity: 80,
      productId: 2,
      status: LotStatus.AVAILABLE,
      expirationDate: '2026-09-15',
    };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterLot, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: { lotId: 4 } },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterLot);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      httpMock.expectOne(productsUrl).flush(mockProducts);
      httpMock.expectOne(`${lotsUrl}/4`).flush(mockLot);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe poblar el formulario con los datos del lote', () => {
      expect(component.formularioRegistration.get('stock')!.value).toBe(80);
      expect(component.formularioRegistration.get('product')!.value).toBe(2);
      expect(component.formularioRegistration.get('expirationDate')!.value).toBe('2026-09-15');
    });

    it('onSubmit() debe llamar a updateLot() (PUT)', () => {
      component.formularioRegistration.setValue({
        stock: 60,
        product: 2,
        status: LotStatus.AVAILABLE,
        expirationDate: '2026-09-15',
      });

      component.onSubmit();

      const req = httpMock.expectOne(lotsUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.lotId).toBe(4);
      expect(req.request.body.stockQuantity).toBe(60);
      req.flush({ ...mockLot, stockQuantity: 60 });
    });
  });
});
