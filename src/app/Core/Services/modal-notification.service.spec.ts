import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { ModalNotificationService } from './modal-notification.service';

describe('ModalNotificationService', () => {
  let service: ModalNotificationService;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDialogRef = { close: vi.fn() };
    mockDialog = { open: vi.fn().mockReturnValue(mockDialogRef) };

    TestBed.configureTestingModule({
      providers: [
        ModalNotificationService,
        { provide: Dialog, useValue: mockDialog },
      ],
    });

    service = TestBed.inject(ModalNotificationService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe abrir el MessageModal con el título y mensaje correctos', () => {
    service.showSuccess('Título Test', 'Mensaje Test', () => {});
    expect(mockDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      { data: { title: 'Título Test', message: 'Mensaje Test' } },
    );
  });

  it('debe cerrar el modal tras el delay por defecto (1500ms)', () => {
    service.showSuccess('Test', 'Test', () => {});
    expect(mockDialogRef.close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('debe ejecutar onClose tras el delay', () => {
    const onClose = vi.fn();
    service.showSuccess('Test', 'Test', onClose);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe respetar un delay personalizado', () => {
    const onClose = vi.fn();
    service.showSuccess('Test', 'Test', onClose, 3000);
    vi.advanceTimersByTime(1500);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
