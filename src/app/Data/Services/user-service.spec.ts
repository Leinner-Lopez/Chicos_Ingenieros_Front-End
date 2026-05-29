import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user-service';
import { User, UserDTO } from '../Interfaces/User';
import { Role } from '../Enum/Role';
import { UserStatus } from '../Enum/UserStatus';
import { environment } from '../../../environments/environment';
import { API_URL } from '../../tokens/api-url.token';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/users`;

  const mockUser: User = {
    userId: 1,
    documentNumber: '1234567890',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    password: 'hashed',
    role: Role.CUSTOMER,
    phoneNumber: '3001234567',
    status: UserStatus.ACTIVE,
  };

  const mockUserDTO: UserDTO = {
    userId: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: API_URL, useValue: environment.apiUrl },
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('saveUser()', () => {
    it('debe crear un nuevo usuario (POST)', () => {
      const newUser: User = { ...mockUser, userId: 0 };

      service.saveUser(newUser).subscribe((user) => {
        expect(user.userId).toBe(1);
        expect(user.email).toBe('juan@test.com');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockUser);
    });
  });

  describe('getAllUsers()', () => {
    it('debe retornar la lista de UserDTO (GET)', () => {
      const mockList: UserDTO[] = [mockUserDTO];

      service.getAllUsers().subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].role).toBe(Role.CUSTOMER);
        expect(users[0].status).toBe(UserStatus.ACTIVE);
        expect(users).toEqual(mockList);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getUsersByStatus()', () => {
    it('debe retornar solo usuarios activos (GET)', () => {
      const mockList: UserDTO[] = [mockUserDTO];

      service.getUsersByStatus(UserStatus.ACTIVE).subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].status).toBe(UserStatus.ACTIVE);
      });

      const req = httpMock.expectOne(`${apiUrl}/status/${UserStatus.ACTIVE}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('debe retornar solo usuarios inactivos (GET)', () => {
      const inactiveDTO: UserDTO = { ...mockUserDTO, status: UserStatus.INACTIVE };

      service.getUsersByStatus(UserStatus.INACTIVE).subscribe((users) => {
        expect(users[0].status).toBe(UserStatus.INACTIVE);
      });

      const req = httpMock.expectOne(`${apiUrl}/status/${UserStatus.INACTIVE}`);
      expect(req.request.method).toBe('GET');
      req.flush([inactiveDTO]);
    });
  });

  describe('getCountUsers()', () => {
    it('debe retornar el total de usuarios (GET)', () => {
      service.getCountUsers().subscribe((count) => {
        expect(count).toBe(20);
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(20);
    });
  });

  describe('getCountUsersByStatus()', () => {
    it('debe retornar el total de usuarios activos (GET)', () => {
      service.getCountUsersByStatus(UserStatus.ACTIVE).subscribe((count) => {
        expect(count).toBe(15);
      });

      const req = httpMock.expectOne(`${apiUrl}/count/status/${UserStatus.ACTIVE}`);
      expect(req.request.method).toBe('GET');
      req.flush(15);
    });
  });

  describe('findUserById()', () => {
    it('debe retornar el usuario correspondiente al ID (GET)', () => {
      service.findUserById(1).subscribe((user) => {
        expect(user.userId).toBe(1);
        expect(user.firstName).toBe('Juan');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('findUserByEmail()', () => {
    it('debe retornar el usuario correspondiente al email (GET)', () => {
      service.findUserByEmail('juan@test.com').subscribe((user) => {
        expect(user.email).toBe('juan@test.com');
        expect(user.status).toBe(UserStatus.ACTIVE);
      });

      const req = httpMock.expectOne(`${apiUrl}/email/juan@test.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('updateUser()', () => {
    it('debe actualizar un usuario existente (PUT)', () => {
      const updated: User = { ...mockUser, firstName: 'Carlos', status: UserStatus.INACTIVE };

      service.updateUser(updated).subscribe((user) => {
        expect(user.firstName).toBe('Carlos');
        expect(user.status).toBe(UserStatus.INACTIVE);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);
    });
  });

  describe('toggleUserStatus()', () => {
    it('debe cambiar el estado del usuario (PATCH)', () => {
      const toggled: User = { ...mockUser, status: UserStatus.INACTIVE };

      service.toggleUserStatus(1).subscribe((user) => {
        expect(user.status).toBe(UserStatus.INACTIVE);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/toggle-status`);
      expect(req.request.method).toBe('PATCH');
      req.flush(toggled);
    });
  });

  describe('deleteUser()', () => {
    it('debe eliminar el usuario por ID (DELETE)', () => {
      service.deleteUser(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
