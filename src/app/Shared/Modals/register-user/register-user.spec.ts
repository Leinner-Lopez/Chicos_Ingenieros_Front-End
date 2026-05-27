import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { RegisterUser } from './register-user';
import { Role } from '../../../Data/Enum/Role';
import { UserStatus } from '../../../Data/Enum/UserStatus';
import { environment } from '../../../../environments/environment';
import { API_URL } from '../../../tokens/api-url.token';


describe('RegisterUser', () => {
  let component: RegisterUser;
  let fixture: ComponentFixture<RegisterUser>;
  let httpMock: HttpTestingController;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  const usersUrl = `${environment.apiUrl}/users`;

  const validFormValue = {
    names: 'Juan',
    lastNames: 'Pérez',
    documentNumber: 1234567890,
    email: 'juan@test.com',
    userRole: 'CUSTOMER',
    phoneNumber: 3001234567,
    password: 'password123',
    confirmPassword: 'password123',
  };

  describe('modo creación (sin userId)', () => {
    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterUser, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: {} },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterUser);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('formulario debe inicializarse inválido cuando está vacío', () => {
      expect(component.registrationForm.invalid).toBe(true);
    });

    it('formulario debe ser inválido si las contraseñas no coinciden', () => {
      component.registrationForm.setValue({ ...validFormValue, confirmPassword: 'diferente' });
      expect(component.registrationForm.hasError('passwordMismatch')).toBe(true);
      expect(component.registrationForm.invalid).toBe(true);
    });

    it('formulario debe ser válido con todos los campos correctos', () => {
      component.registrationForm.setValue(validFormValue);
      expect(component.registrationForm.valid).toBe(true);
    });

    it('onSubmit() con formulario inválido no debe realizar petición HTTP', () => {
      component.onSubmit();
      httpMock.expectNone(usersUrl);
    });

    it('onSubmit() con formulario válido debe llamar a saveUser() (POST)', () => {
      component.registrationForm.setValue(validFormValue);

      component.onSubmit();

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.firstName).toBe('Juan');
      expect(req.request.body.email).toBe('juan@test.com');
      expect(req.request.body.status).toBe(UserStatus.ACTIVE);
      req.flush({});
    });

    it('closeModal() debe cerrar el diálogo con "Usuario registrado"', () => {
      component.closeModal();
      expect(mockDialogRef.close).toHaveBeenCalledWith('Usuario registrado');
    });

    it('hasError() debe retornar true para campo requerido tocado y vacío', () => {
      component.registrationForm.get('names')!.markAsTouched();
      expect(component.hasError('names', 'required')).toBe(true);
    });

    it('hasError() debe retornar false para campo válido', () => {
      component.registrationForm.get('names')!.setValue('Juan');
      component.registrationForm.get('names')!.markAsTouched();
      expect(component.hasError('names', 'required')).toBe(false);
    });
  });

  describe('modo edición (con userId)', () => {
    const mockUser = {
      userId: 5,
      firstName: 'Carlos',
      lastName: 'López',
      documentNumber: '9876543210',
      email: 'carlos@test.com',
      role: Role.ADMIN,
      phoneNumber: '3109876543',
      password: '',
      status: UserStatus.ACTIVE,
    };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

      await TestBed.configureTestingModule({
        imports: [RegisterUser, HttpClientTestingModule],
        providers: [
          { provide: DIALOG_DATA, useValue: { userId: 5 } },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: Dialog, useValue: mockDialog },
          { provide: API_URL, useValue: environment.apiUrl },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterUser);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      httpMock.expectOne(`${usersUrl}/5`).flush(mockUser);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe poblar el formulario con los datos del usuario', () => {
      expect(component.registrationForm.get('names')!.value).toBe('Carlos');
      expect(component.registrationForm.get('lastNames')!.value).toBe('López');
      expect(component.registrationForm.get('email')!.value).toBe('carlos@test.com');
    });

    it('debe deshabilitar el campo documentNumber en modo edición', () => {
      expect(component.registrationForm.get('documentNumber')!.disabled).toBe(true);
    });

    it('debe eliminar la validación de contraseña en modo edición', () => {
      expect(component.registrationForm.get('password')!.errors).toBeNull();
    });

    it('onSubmit() debe llamar a updateUser() (PUT)', () => {
      component.registrationForm.patchValue({ names: 'Carlos Modificado' });

      component.onSubmit();

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.userId).toBe(5);
      expect(req.request.body.firstName).toBe('Carlos Modificado');
      req.flush({});
    });
  });
});
