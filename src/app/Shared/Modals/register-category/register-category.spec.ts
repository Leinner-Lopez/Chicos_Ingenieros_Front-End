import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { RegisterCategory } from './register-category';
import { environment } from '../../../../environments/environment';
import { API_URL } from '../../../tokens/api-url.token';


describe('RegisterCategory', () => {
  let component: RegisterCategory;
  let fixture: ComponentFixture<RegisterCategory>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  const categoriesUrl = `${environment.apiUrl}/categories`;

  describe('modo creación (sin categoryId)', () => {
    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterCategory, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: {} },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterCategory);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('formulario debe inicializarse vacío', () => {
      expect(component.formularioRegistration.value).toEqual({ name: '', description: '' });
    });

    it('formulario inválido cuando campos están vacíos', () => {
      expect(component.formularioRegistration.invalid).toBe(true);
    });

    it('formulario válido cuando todos los campos están completos', () => {
      component.formularioRegistration.setValue({ name: 'Lácteos', description: 'Productos lácteos' });
      expect(component.formularioRegistration.valid).toBe(true);
    });

    it('onSubmit() con formulario inválido no debe realizar petición HTTP', () => {
      component.onSubmit();
      httpMock.expectNone(categoriesUrl);
    });

    it('onSubmit() con formulario válido debe llamar a saveCategory() (POST)', () => {
      component.formularioRegistration.setValue({ name: 'Granos', description: 'Arroz, frijol, etc.' });

      component.onSubmit();

      const req = httpMock.expectOne(categoriesUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Granos');
      expect(req.request.body.description).toBe('Arroz, frijol, etc.');
      req.flush({ categoryId: 3, name: 'Granos', description: 'Arroz, frijol, etc.' });
    });

    it('closeModal() debe cerrar el diálogo con "Categoría registrada"', () => {
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('Categoría registrada');
    });

    it('hasError() debe retornar true cuando el campo es requerido y está tocado', () => {
      component.formularioRegistration.get('name')!.markAsTouched();
      expect(component.hasError('name', 'required')).toBe(true);
    });
  });

  describe('modo edición (con categoryId)', () => {
    const mockCategory = { categoryId: 4, name: 'Bebidas', description: 'Jugos y refrescos' };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterCategory, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: { categoryId: 4 } },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterCategory);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      httpMock.expectOne(`${categoriesUrl}/4`).flush(mockCategory);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe poblar el formulario con los datos de la categoría', () => {
      expect(component.formularioRegistration.value.name).toBe('Bebidas');
      expect(component.formularioRegistration.value.description).toBe('Jugos y refrescos');
    });

    it('onSubmit() debe llamar a updateCategory() (PUT)', () => {
      component.formularioRegistration.setValue({ name: 'Bebidas Premium', description: 'Jugos y refrescos' });

      component.onSubmit();

      const req = httpMock.expectOne(categoriesUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.categoryId).toBe(4);
      expect(req.request.body.name).toBe('Bebidas Premium');
      req.flush({ ...mockCategory, name: 'Bebidas Premium' });
    });
  });
});
