import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { InactiveUsers } from './inactive-users';
import { ModalNotificationService } from '../../../Core/Services/modal-notification.service';
import { UserStatus } from '../../../Data/Enum/UserStatus';
import { UserDTO } from '../../../Data/Interfaces/User';
import { Role } from '../../../Data/Enum/Role';
import { environment } from '../../../../environments/environment';
import { API_URL } from '../../../tokens/api-url.token';

describe('InactiveUsers', () => {
  let component: InactiveUsers;
  let fixture: ComponentFixture<InactiveUsers>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockModalNotification: { showSuccess: ReturnType<typeof vi.fn> };

  const inactiveUrl = `${environment.apiUrl}/users/status/${UserStatus.INACTIVE}`;

  const mockInactiveUsers: UserDTO[] = [
    { userId: 1, firstName: 'Ana', lastName: 'López', email: 'ana@test.com', role: Role.CUSTOMER, status: UserStatus.INACTIVE },
    { userId: 2, firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@test.com', role: Role.ADMIN, status: UserStatus.INACTIVE },
  ];

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockModalNotification = { showSuccess: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InactiveUsers, HttpClientTestingModule],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: ModalNotificationService, useValue: mockModalNotification },
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InactiveUsers);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges(); // dispara ngOnInit → loadInactiveUsers()
    httpMock.expectOne(inactiveUrl).flush(mockInactiveUsers);
  });

  afterEach(() => httpMock.verify());

  // ── Inicialización ─────────────────────────────────────────────────────────

  describe('inicialización', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar los usuarios inactivos en ngOnInit', () => {
      expect(component.users().length).toBe(2);
      expect(component.users()[0].firstName).toBe('Ana');
      expect(component.users()[1].firstName).toBe('Carlos');
    });

    it('reactivated debe inicializarse en false', () => {
      expect(component.reactivated).toBe(false);
    });
  });

  // ── loadInactiveUsers() ────────────────────────────────────────────────────

  describe('loadInactiveUsers()', () => {
    it('debe hacer GET a /users/status/INACTIVE', () => {
      component.loadInactiveUsers();
      const req = httpMock.expectOne(inactiveUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('debe actualizar el signal users con la respuesta', () => {
      component.loadInactiveUsers();
      httpMock.expectOne(inactiveUrl).flush([mockInactiveUsers[0]]);
      expect(component.users().length).toBe(1);
      expect(component.users()[0].email).toBe('ana@test.com');
    });

    it('debe dejar users vacío cuando no hay inactivos', () => {
      component.loadInactiveUsers();
      httpMock.expectOne(inactiveUrl).flush([]);
      expect(component.users().length).toBe(0);
    });
  });

  // ── reactivate() ───────────────────────────────────────────────────────────

  describe('reactivate()', () => {
    it('debe llamar a PATCH /users/{id}/toggle-status', () => {
      component.reactivate(1);

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1/toggle-status`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockInactiveUsers[0], status: UserStatus.ACTIVE });
    });

    it('debe marcar reactivated como true tras la respuesta exitosa', () => {
      component.reactivate(1);
      httpMock
        .expectOne(`${environment.apiUrl}/users/1/toggle-status`)
        .flush({ ...mockInactiveUsers[0], status: UserStatus.ACTIVE });

      expect(component.reactivated).toBe(true);
    });

    it('debe llamar a showSuccess con el título y mensaje correctos', () => {
      component.reactivate(1);
      httpMock
        .expectOne(`${environment.apiUrl}/users/1/toggle-status`)
        .flush({ ...mockInactiveUsers[0], status: UserStatus.ACTIVE });

      expect(mockModalNotification.showSuccess).toHaveBeenCalledWith(
        'Usuario Reactivado',
        'El usuario ha sido reactivado exitosamente.',
        expect.any(Function),
      );
    });

    it('debe recargar la lista al ejecutar el callback de showSuccess', () => {
      component.reactivate(1);
      httpMock
        .expectOne(`${environment.apiUrl}/users/1/toggle-status`)
        .flush({ ...mockInactiveUsers[0], status: UserStatus.ACTIVE });

      // Extraemos y ejecutamos el callback que se pasó a showSuccess
      const callback: () => void = mockModalNotification.showSuccess.mock.calls[0][2];
      callback();

      httpMock.expectOne(inactiveUrl).flush([mockInactiveUsers[1]]);
      expect(component.users().length).toBe(1);
      expect(component.users()[0].firstName).toBe('Carlos');
    });

    it('debe acumular reactivaciones: reactivated sigue true si se reactiva otro usuario', () => {
      component.reactivate(1);
      httpMock
        .expectOne(`${environment.apiUrl}/users/1/toggle-status`)
        .flush({ ...mockInactiveUsers[0], status: UserStatus.ACTIVE });

      expect(component.reactivated).toBe(true);

      // Callback recarga la lista
      const callback: () => void = mockModalNotification.showSuccess.mock.calls[0][2];
      callback();
      httpMock.expectOne(inactiveUrl).flush([mockInactiveUsers[1]]);

      // Segunda reactivación
      component.reactivate(2);
      httpMock
        .expectOne(`${environment.apiUrl}/users/2/toggle-status`)
        .flush({ ...mockInactiveUsers[1], status: UserStatus.ACTIVE });

      expect(component.reactivated).toBe(true);
    });
  });

  // ── closeModal() ───────────────────────────────────────────────────────────

  describe('closeModal()', () => {
    it('debe cerrar con undefined si no hubo ninguna reactivación', () => {
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
    });

    it('debe cerrar con "reactivated" si hubo al menos una reactivación', () => {
      component.reactivated = true;
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('reactivated');
    });

    it('debe cerrar con undefined antes de haber reactivado aunque se llame múltiples veces', () => {
      component.closeModal();
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2);
      expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
    });
  });
});
