import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { ProductsCustomer } from './products';
import { BuyProductModal } from '../../../../Shared/Modals/buy-product-modal/buy-product-modal';
import { AuthService } from '../../../../Core/Services/auth-service';
import { environment } from '../../../../../environments/environment';
import { API_URL } from '../../../../tokens/api-url.token';


describe('ProductsCustomer', () => {
  let component: ProductsCustomer;
  let fixture: ComponentFixture<ProductsCustomer>;
  let httpMock: HttpTestingController;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<string | undefined>;

  const productsUrl = `${environment.apiUrl}/products`;
  const categoriesUrl = `${environment.apiUrl}/categories`;
  const categoryUrl = (id: number) => `${environment.apiUrl}/products/category/${id}`;

  const mockProducts = [
    {
      productId: 1,
      name: 'Arroz Diana',
      categoryName: 'Granos',
      price: 3500,
      imageUrl: '',
      description: '',
      totalStock: 50,
    },
    {
      productId: 2,
      name: 'Leche Entera',
      categoryName: 'Lácteos',
      price: 4200,
      imageUrl: '',
      description: '',
      totalStock: 20,
    },
  ];

  const mockCategories = [
    { categoryId: 1, name: 'Granos', description: 'Cereales y granos' },
    { categoryId: 2, name: 'Lácteos', description: 'Lácteos y derivados' },
  ];

  const granoProducts = [
    {
      productId: 1,
      name: 'Arroz Diana',
      categoryName: 'Granos',
      price: 3500,
      imageUrl: '',
      description: '',
      totalStock: 50,
    },
  ];

  beforeEach(async () => {
    dialogClosed = new Subject<string | undefined>();
    mockDialog = { open: vi.fn().mockReturnValue({ closed: dialogClosed.asObservable() }) };

    await TestBed.configureTestingModule({
      imports: [ProductsCustomer, HttpClientTestingModule],
      providers: [
        { provide: Dialog, useValue: mockDialog },
        { provide: AuthService, useValue: { getUserId: vi.fn().mockReturnValue(1) } },
        { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: API_URL, useValue: environment.apiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsCustomer);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    // ngOnInit: loadProducts(0) → getAllProducts(), y getAllCategories()
    httpMock.expectOne(productsUrl).flush(mockProducts);
    httpMock.expectOne(categoriesUrl).flush(mockCategories);
  });

  afterEach(() => {
    dialogClosed.complete();
    httpMock.verify();
  });

  describe('inicialización', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar todos los productos en ngOnInit', () => {
      expect(component.catalogProduct().length).toBe(2);
      expect(component.catalogProduct()[0].name).toBe('Arroz Diana');
    });

    it('debe cargar las categorías en ngOnInit', () => {
      expect(component.categories().length).toBe(2);
      expect(component.categories()[0].name).toBe('Granos');
    });

    it('selectedCategoryId debe ser 0 al inicializar', () => {
      expect(component.selectedCategoryId()).toBe(0);
    });
  });

  describe('loadProducts()', () => {
    it('loadProducts(0) debe llamar a getAllProducts() y mostrar todos', () => {
      component.loadProducts(0);
      httpMock.expectOne(productsUrl).flush(mockProducts);
      expect(component.selectedCategoryId()).toBe(0);
      expect(component.catalogProduct().length).toBe(2);
    });

    it('loadProducts(categoryId) debe filtrar por categoría', () => {
      component.loadProducts(1);
      httpMock.expectOne(categoryUrl(1)).flush(granoProducts);
      expect(component.selectedCategoryId()).toBe(1);
      expect(component.catalogProduct().length).toBe(1);
      expect(component.catalogProduct()[0].name).toBe('Arroz Diana');
    });

    it('debe actualizar selectedCategoryId al filtrar por otra categoría', () => {
      component.loadProducts(2);
      httpMock.expectOne(categoryUrl(2)).flush([]);
      expect(component.selectedCategoryId()).toBe(2);
      expect(component.catalogProduct().length).toBe(0);
    });

    it('debe volver a mostrar todos los productos al llamar con 0', () => {
      // Primero filtra
      component.loadProducts(1);
      httpMock.expectOne(categoryUrl(1)).flush(granoProducts);
      expect(component.catalogProduct().length).toBe(1);

      // Luego regresa a todos
      component.loadProducts(0);
      httpMock.expectOne(productsUrl).flush(mockProducts);
      expect(component.catalogProduct().length).toBe(2);
      expect(component.selectedCategoryId()).toBe(0);
    });
  });

  describe('registerSale()', () => {
    it('debe abrir BuyProductModal con el productId correcto', () => {
      component.registerSale(5);
      expect(mockDialog.open).toHaveBeenCalledWith(BuyProductModal, { data: { productId: 5 } });
    });

    it('tras compra exitosa debe recargar con la categoría actual (0 = todos)', () => {
      component.registerSale(1);
      dialogClosed.next('Sale registered successfully');
      httpMock.expectOne(productsUrl).flush(mockProducts);
      expect(component.catalogProduct().length).toBe(2);
    });

    it('tras compra exitosa debe recargar con el filtro de categoría activo', () => {
      // Filtrar por categoría 1 primero
      component.loadProducts(1);
      httpMock.expectOne(categoryUrl(1)).flush(granoProducts);
      expect(component.selectedCategoryId()).toBe(1);

      // Comprar un producto
      component.registerSale(1);
      dialogClosed.next('Sale registered successfully');

      // Debe recargar con la misma categoría
      httpMock.expectOne(categoryUrl(1)).flush(granoProducts);
      expect(component.catalogProduct().length).toBe(1);
    });

    it('no debe recargar si el modal cierra sin éxito', () => {
      component.registerSale(1);
      dialogClosed.next(undefined);
      httpMock.expectNone(productsUrl);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.registerSale(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(productsUrl);
    });
  });
});
