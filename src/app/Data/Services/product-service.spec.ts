import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product-service';
import {
  ProductDTO,
  ProductInventoryDTO,
  ProductRequest,
  ProductResponse,
} from '../Interfaces/Product';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  const mockProductRequest: ProductRequest = {
    productId: 1,
    name: 'Arroz Diana',
    description: 'Bolsa 1kg',
    price: 3500,
    minStock: 10,
    categoryId: 2,
    imageUrl: 'https://res.cloudinary.com/test/image/upload/arroz.jpg',
  };

  const mockProductDTO: ProductDTO = {
    productId: 1,
    name: 'Arroz Diana',
    categoryName: 'Granos',
    price: 3500,
    imageUrl: 'https://res.cloudinary.com/test/image/upload/arroz.jpg',
    description: 'Bolsa 1kg',
    totalStock: 50,
  };

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

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('saveProduct()', () => {
    it('debe enviar FormData mediante POST y retornar el producto creado', () => {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ name: 'Arroz Diana', price: 3500 }));
      formData.append('image', new Blob([''], { type: 'image/jpeg' }), 'arroz.jpg');

      service.saveProduct(formData).subscribe((product) => {
        expect(product.name).toBe('Arroz Diana');
        expect(product.productId).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockProductRequest);
    });
  });

  describe('getAllProducts()', () => {
    it('debe retornar la lista de ProductDTO (GET)', () => {
      const mockList: ProductDTO[] = [mockProductDTO];

      service.getAllProducts().subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].categoryName).toBe('Granos');
        expect(products).toEqual(mockList);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getCountProducts()', () => {
    it('debe retornar el total de productos (GET)', () => {
      service.getCountProducts().subscribe((count) => {
        expect(count).toBe(12);
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(12);
    });
  });

  describe('getProductsByCategory()', () => {
    it('debe retornar productos filtrados por categoría (GET)', () => {
      const mockList: ProductDTO[] = [mockProductDTO];

      service.getProductsByCategory(2).subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].productId).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/category/2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getInventory()', () => {
    it('debe retornar la lista de inventario (GET)', () => {
      const mockInventory: ProductInventoryDTO[] = [
        { productId: 1, name: 'Arroz Diana', minStock: 10, totalStock: 50 },
        { productId: 2, name: 'Leche Entera', minStock: 5, totalStock: 3 },
      ];

      service.getInventory().subscribe((inventory) => {
        expect(inventory.length).toBe(2);
        expect(inventory[1].totalStock).toBe(3);
      });

      const req = httpMock.expectOne(`${apiUrl}/inventory`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInventory);
    });
  });

  describe('findProductById()', () => {
    it('debe retornar el producto correspondiente al ID (GET)', () => {
      service.findProductById(1).subscribe((product) => {
        expect(product.productId).toBe(1);
        expect(product.name).toBe('Arroz Diana');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductRequest);
    });
  });

  describe('updateProduct()', () => {
    it('debe actualizar un producto existente (PUT)', () => {
      const updated: ProductResponse = {
        productId: 1,
        name: 'Arroz Premium',
        description: 'Bolsa 1kg mejorada',
        price: 3800,
        minStock: 15,
        categoryId: 2,
      };

      service.updateProduct(updated).subscribe((product) => {
        expect(product.price).toBe(3800);
        expect(product.name).toBe('Arroz Premium');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush({ ...updated, imageUrl: mockProductRequest.imageUrl });
    });
  });

  describe('deleteProduct()', () => {
    it('debe eliminar el producto por ID (DELETE)', () => {
      service.deleteProduct(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
