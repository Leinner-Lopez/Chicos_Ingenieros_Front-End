import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user-service';
import { User } from '../Interfaces/User';
import { Role } from '../Enum/Role';
import { UserStatus } from '../Enum/UserStatus';
import { environment } from '../../../environments/environment';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
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
    it('debe retornar la lista de usuarios (GET)', () => {
      const mockList: User[] = [mockUser];

      service.getAllUsers().subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].role).toBe(Role.CUSTOMER);
        expect(users).toEqual(mockList);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
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

  describe('deleteUser()', () => {
    it('debe eliminar el usuario por ID (DELETE)', () => {
      service.deleteUser(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
