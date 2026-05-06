import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category-service';
import { Category } from '../Interfaces/Category';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/categories`;

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

  // Test para Obtener Categorías
  it('obtener todas las categorías (GET)', () => {
    const mockCategories: Category[] = [
      { category_id: 1, name: 'Lácteos', description: 'Lácteos y derivados' },
      { category_id: 2, name: 'Cárnicos', description: 'Cárnicos y derivados' },
    ];

    service.getAllCategories().subscribe((categories) => {
      expect(categories.length).toBe(2);
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  // Test para Guardar Categoría
  it('guardar una nueva categoría (POST)', () => {
    const newCategory: Category = {
      category_id: 3,
      name: 'Verduras',
      description: 'Verduras frescas',
    };

    service.saveCategory(newCategory).subscribe((category) => {
      expect(category.name).toBe('Verduras');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCategory);
    req.flush({ id: 3, ...newCategory });
  });

  // Test para Eliminar Categoría
  it('eliminar una categoría por ID (DELETE)', () => {
    const categoryId = 1;

    service.deleteCategory(categoryId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Test para Buscar por ID
  it('encontrar una categoría por su ID (GET)', () => {
    const mockCategory: Category = { category_id: 10, name: 'Bebidas' };

    service.findCategoryById(10).subscribe((category) => {
      expect(category).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(`${apiUrl}/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });
});
