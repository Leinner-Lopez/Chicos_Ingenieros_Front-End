import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product-service';
import { Product, ProductDTO } from '../Interfaces/Product';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Test para getAllProducts (Usa ProductDTO)
  it('debe retornar una lista de ProductDTO (GET)', () => {
    const mockProductsDTO: ProductDTO[] = [
      {
        product_id: 1,
        name: 'Arroz Diana',
        categoryName: 'Granos',
        price: 3500,
        description: 'Bolsa de 1kg',
      },
    ];

    service.getAllProducts().subscribe((products) => {
      expect(products[0].product_id).toBe(1);
      expect(products[0].categoryName).toBe('Granos');
      expect(products).toEqual(mockProductsDTO);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductsDTO);
  });

  // Test para saveProduct (Usa Product con objeto category)
  it('debe guardar un producto nuevo (POST)', () => {
    const newProduct: Product = {
      product_id: 0, // O el valor que manejes antes de persistir
      name: 'Leche Entera',
      description: 'Bolsa 1L',
      price: 4200,
      min_stock: 10,
      category: { category_id: 1, name: 'Lácteos' }, // Asumiendo estructura de Category
    };

    service.saveProduct(newProduct).subscribe((product) => {
      expect(product.name).toBe('Leche Entera');
      expect(product.category.name).toBe('Lácteos');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newProduct, product_id: 101 });
  });

  // Test para findProductById (Usa Product)
  it('debe buscar un producto por product_id (GET)', () => {
    const productId = 5;
    const mockProduct: Product = {
      product_id: 5,
      name: 'Aceite de Girasol',
      description: 'Envase 1000ml',
      price: 12000,
      min_stock: 5,
      category: { category_id: 2, name: 'Aceites' },
    };

    service.findProductById(productId).subscribe((product) => {
      expect(product.product_id).toBe(5);
      expect(product.category.name).toBe('Aceites');
    });

    const req = httpMock.expectOne(`${apiUrl}/${productId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  // Test para updateProduct
  it('debe actualizar un producto existente (PUT)', () => {
    const updatedProduct: Product = {
      product_id: 1,
      name: 'Arroz Premium',
      description: 'Bolsa de 1kg',
      price: 3800,
      min_stock: 20,
      category: { category_id: 3, name: 'Granos' },
    };

    service.updateProduct(updatedProduct).subscribe((product) => {
      expect(product.price).toBe(3800);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedProduct);
  });
});
