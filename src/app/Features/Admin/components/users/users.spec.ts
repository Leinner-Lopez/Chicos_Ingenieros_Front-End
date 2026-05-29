import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { Users } from './users';
import { RegisterUser } from '../../../../Shared/Modals/register-user/register-user';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';
import { InactiveUsers } from '../../../../Shared/Modals/inactive-users/inactive-users';
import { UserStatus } from '../../../../Data/Enum/UserStatus';
import { environment } from '../../../../../environments/environment';
import { API_URL } from '../../../../tokens/api-url.token';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let httpMock: HttpTestingController;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<string | undefined>;

  const activeUsersUrl = `${environment.apiUrl}/users/status/${UserStatus.ACTIVE}`;
  const activeCountUrl = `${environment.apiUrl}/users/count/status/${UserStatus.ACTIVE}`;

  const mockUsers = [
    { userId: 1, firstName: 'Ana', lastName: 'López', email: 'ana@test.com', role: 'CUSTOMER', status: UserStatus.ACTIVE },
    { userId: 2, firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@test.com', role: 'ADMIN', status: UserStatus.ACTIVE },
  ];

  beforeEach(async () => {
    dialogClosed = new Subject<string | undefined>();
    mockDialog = { open: vi.fn().mockReturnValue({ closed: dialogClosed.asObservable() }) };

    await TestBed.configureTestingModule({
      imports: [Users, HttpClientTestingModule],
      providers: [
        { provide: Dialog, useValue: mockDialog },
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(activeUsersUrl).flush(mockUsers);
    httpMock.expectOne(activeCountUrl).flush(2);
  });

  afterEach(() => {
    dialogClosed.complete();
    httpMock.verify();
  });

  describe('inicialización', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar solo usuarios activos en ngOnInit', () => {
      expect(component.users().length).toBe(2);
      expect(component.users()[0].firstName).toBe('Ana');
      expect(component.users()[1].firstName).toBe('Carlos');
    });

    it('debe cargar el conteo de usuarios activos', () => {
      expect(component.usersNumber()).toBe(2);
    });
  });

  describe('registerUser()', () => {
    it('debe abrir el modal RegisterUser sin datos', () => {
      component.registerUser();
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterUser, {});
    });

    it('debe recargar la lista cuando el modal cierra con "Usuario registrado"', () => {
      const nuevoUsuario = {
        userId: 3,
        firstName: 'Nuevo',
        lastName: 'User',
        email: 'new@test.com',
        role: 'CUSTOMER',
        status: UserStatus.ACTIVE,
      };
      component.registerUser();
      dialogClosed.next('Usuario registrado');
      httpMock.expectOne(activeUsersUrl).flush([...mockUsers, nuevoUsuario]);
      httpMock.expectOne(activeCountUrl).flush(3);
      expect(component.users().length).toBe(3);
      expect(component.usersNumber()).toBe(3);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.registerUser();
      dialogClosed.next('Cancelado');
      httpMock.expectNone(activeUsersUrl);
    });

    it('no debe recargar si el modal cierra sin resultado', () => {
      component.registerUser();
      dialogClosed.next(undefined);
      httpMock.expectNone(activeUsersUrl);
    });
  });

  describe('updateUser()', () => {
    it('debe abrir el modal RegisterUser con el userId correcto', () => {
      component.updateUser(5);
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterUser, { data: { userId: 5 } });
    });

    it('debe recargar la lista cuando el modal de edición cierra con éxito', () => {
      component.updateUser(1);
      dialogClosed.next('Usuario registrado');
      httpMock.expectOne(activeUsersUrl).flush(mockUsers);
      httpMock.expectOne(activeCountUrl).flush(2);
      expect(component.users().length).toBe(2);
    });

    it('no debe recargar si el modal de edición cierra con resultado distinto', () => {
      component.updateUser(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(activeUsersUrl);
    });
  });

  describe('deactivateUser()', () => {
    it('debe abrir ConfirmModal con el mensaje y callbacks correctos', () => {
      component.deactivateUser(3);
      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmModal, {
        data: expect.objectContaining({
          message: '¿Deseas desactivar este usuario?',
          successTitle: 'Usuario Desactivado',
          successMessage: 'El usuario ha sido desactivado exitosamente.',
          onConfirm: expect.any(Function),
        }),
      });
    });

    it('debe recargar la lista tras desactivación exitosa', () => {
      component.deactivateUser(1);
      dialogClosed.next('Eliminación Exitosa');
      httpMock.expectOne(activeUsersUrl).flush([mockUsers[1]]);
      httpMock.expectOne(activeCountUrl).flush(1);
      expect(component.users().length).toBe(1);
      expect(component.usersNumber()).toBe(1);
    });

    it('no debe recargar si la desactivación fue cancelada', () => {
      component.deactivateUser(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(activeUsersUrl);
    });
  });

  describe('openInactiveUsers()', () => {
    it('debe abrir el modal InactiveUsers', () => {
      component.openInactiveUsers();
      expect(mockDialog.open).toHaveBeenCalledWith(InactiveUsers, {});
    });

    it('debe recargar la lista cuando se reactivó algún usuario', () => {
      component.openInactiveUsers();
      dialogClosed.next('reactivated');
      httpMock.expectOne(activeUsersUrl).flush(mockUsers);
      httpMock.expectOne(activeCountUrl).flush(2);
      expect(component.users().length).toBe(2);
    });

    it('no debe recargar si el modal se cerró sin reactivar', () => {
      component.openInactiveUsers();
      dialogClosed.next(undefined);
      httpMock.expectNone(activeUsersUrl);
    });
  });
});
