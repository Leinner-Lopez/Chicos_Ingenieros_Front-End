import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { ConfirmModal } from './confirm-modal';
import { of } from 'rxjs';

describe('ConfirmModal', () => {
  let component: ConfirmModal;
  let fixture: ComponentFixture<ConfirmModal>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  async function setup(data: object) {
    mockDialogRef = { close: vi.fn() };
    mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

    await TestBed.configureTestingModule({
      imports: [ConfirmModal],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: Dialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const baseData = {
    message: '¿Eliminar?',
    successTitle: 'Eliminado',
    successMessage: 'Se eliminó exitosamente.',
    onConfirm: () => of(null),
  };

  it('debe ser creado', async () => {
    await setup(baseData);
    expect(component).toBeTruthy();
  });

  it('debe asignar message desde DIALOG_DATA', async () => {
    await setup({ ...baseData, message: '¿Deseas eliminar este producto?' });
    expect(component.message).toBe('¿Deseas eliminar este producto?');
  });

  it('closeModal() debe cerrar el diálogo con "Eliminación Exitosa"', async () => {
    await setup(baseData);
    component.closeModal();
    expect(mockDialogRef.close).toHaveBeenCalledWith('Eliminación Exitosa');
  });

  describe('confirmAction()', () => {
    it('debe invocar el callback onConfirm proporcionado en los datos', async () => {
      const onConfirmMock = vi.fn().mockReturnValue(of(null));
      await setup({ ...baseData, onConfirm: onConfirmMock });
      component.confirmAction();
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('tras onConfirm exitoso debe abrir MessageModal con el título y mensaje correctos', async () => {
      await setup({
        message: '¿Eliminar?',
        successTitle: 'Producto Eliminado',
        successMessage: 'El producto ha sido eliminado exitosamente.',
        onConfirm: () => of(null),
      });
      component.confirmAction();
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: {
            title: 'Producto Eliminado',
            message: 'El producto ha sido eliminado exitosamente.',
          },
        }),
      );
    });

    it('debe funcionar con cualquier entidad sin modificar el componente', async () => {
      const onConfirmMock = vi.fn().mockReturnValue(of(null));
      await setup({
        message: '¿Deseas eliminar este lote?',
        successTitle: 'Lote Eliminado',
        successMessage: 'El lote ha sido eliminado exitosamente.',
        onConfirm: onConfirmMock,
      });
      component.confirmAction();
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('no debe abrir MessageModal si onConfirm no completa', async () => {
      await setup({ ...baseData, onConfirm: () => of() });
      component.confirmAction();
      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });
});
