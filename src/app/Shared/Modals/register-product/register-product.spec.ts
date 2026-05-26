import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { RegisterProduct } from './register-product';
import { environment } from '../../../../environments/environment';

describe('RegisterProduct', () => {
  let component: RegisterProduct;
  let fixture: ComponentFixture<RegisterProduct>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  const categoriesUrl = `${environment.apiUrl}/categories`;
  const productsUrl = `${environment.apiUrl}/products`;

  const mockCategories = [
    { categoryId: 1, name: 'Lácteos', description: 'Lácteos y derivados' },
    { categoryId: 2, name: 'Granos', description: 'Cereales y granos' },
  ];

  const validFormValue = {
    name: 'Arroz Diana',
    description: 'Bolsa de 1 kg',
    minStock: 10,
    price: 3500,
    categories: 2,
  };

  describe('modo creación (sin productId)', () => {
    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterProduct, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: {} },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterProduct);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      // Constructor siempre llama a getAllCategories()
      httpMock.expectOne(categoriesUrl).flush(mockCategories);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar las categorías al inicializar', () => {
      expect(component.categories.length).toBe(2);
      expect(component.categories[0].name).toBe('Lácteos');
    });

    it('formulario debe inicializarse inválido', () => {
      expect(component.formularioRegistration.invalid).toBe(true);
    });

    it('formulario debe ser válido con todos los campos correctos', () => {
      component.formularioRegistration.setValue(validFormValue);
      expect(component.formularioRegistration.valid).toBe(true);
    });

    it('onSubmit() con formulario inválido no debe realizar petición HTTP', () => {
      component.onSubmit();
      httpMock.expectNone(productsUrl);
    });

    it('onSubmit() con formulario válido debe enviar FormData con POST', () => {
      component.formularioRegistration.setValue(validFormValue);
      component.selectedImage = new File([''], 'foto.jpg', { type: 'image/jpeg' });

      component.onSubmit();

      const req = httpMock.expectOne(productsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({
        productId: 1,
        name: 'Arroz Diana',
        description: 'Bolsa de 1 kg',
        price: 3500,
        minStock: 10,
        categoryId: 2,
        imageUrl: 'https://cloudinary.com/test.jpg',
      });
    });

    it('closeModal() debe cerrar el diálogo con "Producto registrado"', () => {
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('Producto registrado');
    });

    it('onImageChange() debe asignar el archivo seleccionado', () => {
      const file = new File([''], 'imagen.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onImageChange(event);
      expect(component.selectedImage).toBe(file);
    });

    it('hasError() debe retornar true para campo requerido tocado y vacío', () => {
      component.formularioRegistration.get('name')!.markAsTouched();
      expect(component.hasError('name', 'required')).toBe(true);
    });
  });

  describe('modo edición (con productId)', () => {
    const mockProduct = {
      productId: 3,
      name: 'Leche Entera',
      description: 'Bolsa 1L',
      price: 4200,
      minStock: 5,
      categoryId: 1,
      imageUrl: 'https://cloudinary.com/leche.jpg',
    };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterProduct, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: { productId: 3 } },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterProduct);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      httpMock.expectOne(categoriesUrl).flush(mockCategories);
      httpMock.expectOne(`${productsUrl}/3`).flush(mockProduct);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe poblar el formulario con los datos del producto', () => {
      expect(component.formularioRegistration.get('name')!.value).toBe('Leche Entera');
      expect(component.formularioRegistration.get('price')!.value).toBe(4200);
      expect(component.formularioRegistration.get('categories')!.value).toBe(1);
    });

    it('onSubmit() debe llamar a updateProduct() (PUT)', () => {
      component.formularioRegistration.setValue({
        name: 'Leche Semidescremada',
        description: 'Bolsa 1L',
        price: 4500,
        minStock: 5,
        categories: 1,
      });

      component.onSubmit();

      const req = httpMock.expectOne(productsUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.productId).toBe(3);
      expect(req.request.body.name).toBe('Leche Semidescremada');
      req.flush({ ...mockProduct, name: 'Leche Semidescremada' });
    });
  });
});
