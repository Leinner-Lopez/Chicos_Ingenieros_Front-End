import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { PLATFORM_ID } from '@angular/core';
import { BuyProductModal } from './buy-product-modal';
import { AuthService } from '../../../Core/Services/auth-service';
import { API_URL } from '../../../tokens/api-url.token';
import { environment } from '../../../../environments/environment';

describe('BuyProductModal', () => {
  let component: BuyProductModal;
  let fixture: ComponentFixture<BuyProductModal>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockAuthService: { getUserId: ReturnType<typeof vi.fn> };

  const salesUrl = `${environment.apiUrl}/sales`;

  async function setup(data: object) {
    mockDialogRef = { close: vi.fn() };
    mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };
    mockAuthService = { getUserId: vi.fn().mockReturnValue(10) };

    await TestBed.configureTestingModule({
      imports: [BuyProductModal, HttpClientTestingModule],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: Dialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuyProductModal);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  describe('inicialización', () => {
    it('debe ser creado', async () => {
      await setup({ productId: 5 });
      expect(component).toBeTruthy();
    });

    it('debe asignar el productId desde DIALOG_DATA', async () => {
      await setup({ productId: 7 });
      expect(component.productId()).toBe(7);
    });

    it('productId debe ser null si data no tiene productId', async () => {
      await setup({});
      expect(component.productId()).toBeNull();
    });
  });

  describe('formulario', () => {
    it('debe inicializarse inválido cuando quantity está vacío', async () => {
      await setup({ productId: 5 });
      expect(component.salesForm.invalid).toBe(true);
    });

    it('debe ser válido cuando quantity tiene un valor', async () => {
      await setup({ productId: 5 });
      component.salesForm.setValue({ quantity: '3' });
      expect(component.salesForm.valid).toBe(true);
    });
  });

  describe('onSubmit()', () => {
    it('no debe realizar petición HTTP si el formulario es inválido', async () => {
      await setup({ productId: 5 });
      component.onSubmit();
      httpMock.expectNone(salesUrl);
    });

    it('debe llamar a saveSale() con los datos correctos (POST)', async () => {
      await setup({ productId: 5 });
      component.salesForm.setValue({ quantity: '2' });

      component.onSubmit();

      const req = httpMock.expectOne(salesUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.productId).toBe(5);
      expect(req.request.body.quantity).toBe(2);
      expect(req.request.body.userId).toBe(10);
      req.flush({ saleId: 1, userId: 10, saleDate: '2026-05-24', totalPrice: 7000 });
    });

    it('tras la compra exitosa debe abrir MessageModal', async () => {
      await setup({ productId: 5 });
      component.salesForm.setValue({ quantity: '2' });
      component.onSubmit();

      httpMock.expectOne(salesUrl).flush({ saleId: 1, userId: 10, saleDate: '2026-05-24', totalPrice: 7000 });

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('closeModal()', () => {
    it('debe cerrar el diálogo con "Sale registered successfully"', async () => {
      await setup({ productId: 5 });
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('Sale registered successfully');
    });
  });

  describe('hasError()', () => {
    it('debe retornar true para campo requerido tocado y vacío', async () => {
      await setup({ productId: 5 });
      component.salesForm.get('quantity')!.markAsTouched();
      expect(component.hasError('quantity', 'required')).toBe(true);
    });

    it('debe retornar false cuando el campo tiene valor', async () => {
      await setup({ productId: 5 });
      component.salesForm.get('quantity')!.setValue('3');
      component.salesForm.get('quantity')!.markAsTouched();
      expect(component.hasError('quantity', 'required')).toBe(false);
    });
  });
});
