import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MessageModal } from './message-modal';

describe('MessageModal', () => {
  let component: MessageModal;
  let fixture: ComponentFixture<MessageModal>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  function setup(data: object = {}) {
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [MessageModal],
      providers: [
        { provide: DIALOG_DATA, useValue: data },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('debe ser creado', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('debe asignar título y mensaje desde DIALOG_DATA', () => {
    setup({ title: 'Éxito', message: 'Operación completada' });
    expect(component.title).toBe('Éxito');
    expect(component.message).toBe('Operación completada');
  });

  it('debe inicializar con strings vacíos si data es nula', () => {
    setup(null as any);
    expect(component.title).toBe('');
    expect(component.message).toBe('');
  });

  it('closeModal() debe cerrar el diálogo', () => {
    setup({ title: 'Test', message: 'Test' });
    component.closeModal();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
