import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category-service';
import { Category } from '../Interfaces/Category';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/categories`;

  const mockCategory: Category = { categoryId: 1, name: 'Lácteos', description: 'Lácteos y derivados' };
  const mockCategories: Category[] = [
    { categoryId: 1, name: 'Lácteos', description: 'Lácteos y derivados' },
    { categoryId: 2, name: 'Cárnicos', description: 'Cárnicos y derivados' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCategories()', () => {
    it('debe retornar la lista de categorías (GET)', () => {
      service.getAllCategories().subscribe((categories) => {
        expect(categories.length).toBe(2);
        expect(categories).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('getCountCategories()', () => {
    it('debe retornar el total de categorías (GET)', () => {
      service.getCountCategories().subscribe((count) => {
        expect(count).toBe(5);
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(5);
    });
  });

  describe('findCategoryById()', () => {
    it('debe retornar la categoría correspondiente al ID (GET)', () => {
      service.findCategoryById(1).subscribe((category) => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('saveCategory()', () => {
    it('debe crear una nueva categoría (POST)', () => {
      const newCategory: Category = { categoryId: 3, name: 'Verduras', description: 'Verduras frescas' };

      service.saveCategory(newCategory).subscribe((category) => {
        expect(category.name).toBe('Verduras');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCategory);
      req.flush(newCategory);
    });
  });

  describe('updateCategory()', () => {
    it('debe actualizar una categoría existente (PUT)', () => {
      const updated: Category = { categoryId: 1, name: 'Lácteos Premium', description: 'Actualizado' };

      service.updateCategory(updated).subscribe((category) => {
        expect(category.name).toBe('Lácteos Premium');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);
    });
  });

  describe('deleteCategory()', () => {
    it('debe eliminar la categoría por ID (DELETE)', () => {
      service.deleteCategory(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
