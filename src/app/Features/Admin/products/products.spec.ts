import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { Products } from './products';
import { RegisterProduct } from '../../../Shared/Modals/register-product/register-product';
import { ConfirmModal } from '../../../Shared/Modals/confirm-modal/confirm-modal';
import { environment } from '../../../../environments/environment';

describe('Products (Admin)', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let httpMock: HttpTestingController;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<string | undefined>;

  const productsUrl = `${environment.apiUrl}/products`;
  const countUrl = `${environment.apiUrl}/products/count`;

  const mockProducts = [
    { productId: 1, name: 'Arroz Diana', categoryName: 'Granos', price: 3500, imageUrl: '', description: '', totalStock: 50 },
    { productId: 2, name: 'Leche Entera', categoryName: 'Lácteos', price: 4200, imageUrl: '', description: '', totalStock: 20 },
  ];

  beforeEach(async () => {
    dialogClosed = new Subject<string | undefined>();
    mockDialog = { open: vi.fn().mockReturnValue({ closed: dialogClosed.asObservable() }) };

    await TestBed.configureTestingModule({
      imports: [Products, HttpClientTestingModule],
      providers: [{ provide: Dialog, useValue: mockDialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(productsUrl).flush(mockProducts);
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

    it('debe cargar los productos en ngOnInit', () => {
      expect(component.products().length).toBe(2);
      expect(component.products()[0].name).toBe('Arroz Diana');
    });

    it('debe cargar el conteo de productos', () => {
      expect(component.productNumber()).toBe(2);
    });
  });

  describe('registerProduct()', () => {
    it('debe abrir el modal RegisterProduct sin datos', () => {
      component.registerProduct();
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterProduct, {});
    });

    it('debe recargar la lista cuando el modal cierra con "Producto registrado"', () => {
      const nuevoProducto = { productId: 3, name: 'Nuevo', categoryName: 'Otros', price: 1000, imageUrl: '', description: '', totalStock: 10 };
      component.registerProduct();
      dialogClosed.next('Producto registrado');
      httpMock.expectOne(productsUrl).flush([...mockProducts, nuevoProducto]);
      httpMock.expectOne(countUrl).flush(3);
      expect(component.products().length).toBe(3);
      expect(component.productNumber()).toBe(3);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.registerProduct();
      dialogClosed.next('Cancelado');
      httpMock.expectNone(productsUrl);
    });

    it('no debe recargar si el modal cierra sin resultado', () => {
      component.registerProduct();
      dialogClosed.next(undefined);
      httpMock.expectNone(productsUrl);
    });
  });

  describe('updateProduct()', () => {
    it('debe abrir el modal RegisterProduct con el productId correcto', () => {
      component.updateProduct(7);
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterProduct, { data: { productId: 7 } });
    });

    it('debe recargar la lista cuando el modal de edición cierra con éxito', () => {
      component.updateProduct(1);
      dialogClosed.next('Producto registrado');
      httpMock.expectOne(productsUrl).flush(mockProducts);
      httpMock.expectOne(countUrl).flush(2);
      expect(component.products().length).toBe(2);
    });

    it('no debe recargar si el modal de edición cierra con resultado distinto', () => {
      component.updateProduct(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(productsUrl);
    });
  });

  describe('deleteProduct()', () => {
    it('debe abrir ConfirmModal con entity="product" y el Id correcto', () => {
      component.deleteProduct(4);
      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmModal, {
        data: { entity: 'product', message: '¿Deseas eliminar este producto?', Id: 4 },
      });
    });

    it('debe recargar la lista tras eliminación exitosa', () => {
      component.deleteProduct(1);
      dialogClosed.next('Eliminación Exitosa');
      httpMock.expectOne(productsUrl).flush([mockProducts[1]]);
      httpMock.expectOne(countUrl).flush(1);
      expect(component.products().length).toBe(1);
      expect(component.productNumber()).toBe(1);
    });

    it('no debe recargar si la eliminación fue cancelada', () => {
      component.deleteProduct(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(productsUrl);
    });
  });
});
