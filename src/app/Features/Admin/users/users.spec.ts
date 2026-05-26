import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Subject } from 'rxjs';
import { Users } from './users';
import { RegisterUser } from '../../../Shared/Modals/register-user/register-user';
import { ConfirmModal } from '../../../Shared/Modals/confirm-modal/confirm-modal';
import { environment } from '../../../../environments/environment';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let httpMock: HttpTestingController;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<string | undefined>;

  const usersUrl = `${environment.apiUrl}/users`;
  const countUrl = `${environment.apiUrl}/users/count`;

  const mockUsers = [
    { userId: 1, firstName: 'Ana', lastName: 'López', email: 'ana@test.com', role: 'CUSTOMER' },
    { userId: 2, firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@test.com', role: 'ADMIN' },
  ];

  beforeEach(async () => {
    dialogClosed = new Subject<string | undefined>();
    mockDialog = { open: vi.fn().mockReturnValue({ closed: dialogClosed.asObservable() }) };

    await TestBed.configureTestingModule({
      imports: [Users, HttpClientTestingModule],
      providers: [{ provide: Dialog, useValue: mockDialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne(usersUrl).flush(mockUsers);
    httpMock.expectOne(countUrl).flush(2);
  });

  afterEach(() => {
    dialogClosed.complete();
    httpMock.verify();
  });

  describe('inicialización', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar los usuarios en ngOnInit', () => {
      expect(component.users().length).toBe(2);
      expect(component.users()[0].firstName).toBe('Ana');
      expect(component.users()[1].firstName).toBe('Carlos');
    });

    it('debe cargar el conteo de usuarios', () => {
      expect(component.usersNumber()).toBe(2);
    });
  });

  describe('registerUser()', () => {
    it('debe abrir el modal RegisterUser sin datos', () => {
      component.registerUser();
      expect(mockDialog.open).toHaveBeenCalledWith(RegisterUser, {});
    });

    it('debe recargar la lista cuando el modal cierra con "Usuario registrado"', () => {
      const nuevoUsuario = { userId: 3, firstName: 'Nuevo', lastName: 'User', email: 'new@test.com', role: 'CUSTOMER' };
      component.registerUser();
      dialogClosed.next('Usuario registrado');
      httpMock.expectOne(usersUrl).flush([...mockUsers, nuevoUsuario]);
      httpMock.expectOne(countUrl).flush(3);
      expect(component.users().length).toBe(3);
      expect(component.usersNumber()).toBe(3);
    });

    it('no debe recargar si el modal cierra con resultado distinto', () => {
      component.registerUser();
      dialogClosed.next('Cancelado');
      httpMock.expectNone(usersUrl);
    });

    it('no debe recargar si el modal cierra sin resultado', () => {
      component.registerUser();
      dialogClosed.next(undefined);
      httpMock.expectNone(usersUrl);
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
      httpMock.expectOne(usersUrl).flush(mockUsers);
      httpMock.expectOne(countUrl).flush(2);
      expect(component.users().length).toBe(2);
    });

    it('no debe recargar si el modal de edición cierra con resultado distinto', () => {
      component.updateUser(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(usersUrl);
    });
  });

  describe('deleteUser()', () => {
    it('debe abrir ConfirmModal con entity="user" y el Id correcto', () => {
      component.deleteUser(3);
      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmModal, {
        data: { entity: 'user', message: '¿Deseas eliminar este usuario?', Id: 3 },
      });
    });

    it('debe recargar la lista tras eliminación exitosa', () => {
      component.deleteUser(1);
      dialogClosed.next('Eliminación Exitosa');
      httpMock.expectOne(usersUrl).flush([mockUsers[1]]);
      httpMock.expectOne(countUrl).flush(1);
      expect(component.users().length).toBe(1);
      expect(component.usersNumber()).toBe(1);
    });

    it('no debe recargar si la eliminación fue cancelada', () => {
      component.deleteUser(1);
      dialogClosed.next('Cancelado');
      httpMock.expectNone(usersUrl);
    });
  });
});
