import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { ConfirmModal } from './confirm-modal';
import { environment } from '../../../../environments/environment';

describe('ConfirmModal', () => {
  let component: ConfirmModal;
  let fixture: ComponentFixture<ConfirmModal>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  async function setup(data: object) {
    mockDialogRef = { close: vi.fn() };
    mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

    await TestBed.configureTestingModule({
      imports: [ConfirmModal, HttpClientTestingModule],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: Dialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModal);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('debe ser creado', async () => {
    await setup({ entity: 'product', message: '¿Eliminar?', Id: 1 });
    expect(component).toBeTruthy();
  });

  it('debe asignar entity, message e id desde DIALOG_DATA', async () => {
    await setup({ entity: 'product', message: '¿Deseas eliminar este producto?', Id: 5 });
    expect(component.entity).toBe('product');
    expect(component.message).toBe('¿Deseas eliminar este producto?');
    expect(component.id).toBe(5);
  });

  it('closeModal() debe cerrar el diálogo con "Eliminación Exitosa"', async () => {
    await setup({ entity: 'product', message: '', Id: 1 });
    component.closeModal();
    expect(mockDialogRef.close).toHaveBeenCalledWith('Eliminación Exitosa');
  });

  describe('confirmAction()', () => {
    it('entity="category" debe llamar a deleteCategory() con el ID correcto', async () => {
      await setup({ entity: 'category', message: '¿Eliminar categoría?', Id: 2 });
      component.confirmAction();

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/2`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('entity="product" debe llamar a deleteProduct() con el ID correcto', async () => {
      await setup({ entity: 'product', message: '¿Eliminar producto?', Id: 7 });
      component.confirmAction();

      const req = httpMock.expectOne(`${environment.apiUrl}/products/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('entity="user" debe llamar a deleteUser() con el ID correcto', async () => {
      await setup({ entity: 'user', message: '¿Eliminar usuario?', Id: 3 });
      component.confirmAction();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/3`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('entity="lot" debe llamar a deleteLot() con el ID correcto', async () => {
      await setup({ entity: 'lot', message: '¿Eliminar lote?', Id: 9 });
      component.confirmAction();

      const req = httpMock.expectOne(`${environment.apiUrl}/lots/9`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('entity desconocida no debe hacer ninguna petición HTTP', async () => {
      await setup({ entity: 'unknown', message: '', Id: 1 });
      component.confirmAction();
      httpMock.expectNone(`${environment.apiUrl}`);
    });

    it('tras eliminar exitosamente debe abrir MessageModal', async () => {
      await setup({ entity: 'product', message: '', Id: 1 });
      component.confirmAction();

      httpMock.expectOne(`${environment.apiUrl}/products/1`).flush(null);

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });
});
