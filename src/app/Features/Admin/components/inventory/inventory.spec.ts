import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Inventory } from './inventory';
import { API_URL } from '../../../../tokens/api-url.token';
import { environment } from '../../../../../environments/environment';

describe('Inventory', () => {
  let component: Inventory;
  let fixture: ComponentFixture<Inventory>;
  let httpMock: HttpTestingController;

  const inventoryUrl = `${environment.apiUrl}/products/inventory`;
  const countUrl = `${environment.apiUrl}/products/count`;

  const mockInventory = [
    {
      productId: 1,
      name: 'Arroz',
      categoryName: 'Granos',
      price: 3500,
      imageUrl: '',
      description: '',
      totalStock: 50,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventory, HttpClientTestingModule],
      providers: [{ provide: API_URL, useValue: environment.apiUrl }],
    }).compileComponents();

    fixture = TestBed.createComponent(Inventory);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(inventoryUrl).flush(mockInventory);
    httpMock.expectOne(countUrl).flush(1);
  });

  afterEach(() => httpMock.verify());

  it('debe ser creado', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar el inventario en ngOnInit', () => {
    expect(component.inventory().length).toBe(1);
    expect(component.inventory()[0].name).toBe('Arroz');
  });

  it('debe cargar el conteo de productos', () => {
    expect(component.productCount()).toBe(1);
  });
});
