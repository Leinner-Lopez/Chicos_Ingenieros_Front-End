import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../../../Core/Services/auth-service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAuthService: { register: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const validForm = {
    names: 'Juan',
    lastNames: 'Pérez',
    documentNumber: '1234567890',
    email: 'juan@test.com',
    phoneNumber: '3001234567',
    password: 'secret123',
    confirmPassword: 'secret123',
  };

  beforeEach(async () => {
    mockAuthService = { register: vi.fn().mockReturnValue(of({ message: 'OK' })) };
    mockDialog = { open: vi.fn().mockReturnValue({ close: vi.fn() }) };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Dialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  describe('formulario', () => {
    it('debe ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializarse inválido', () => {
      expect(component.registrationForm.invalid).toBe(true);
    });

    it('debe ser válido con todos los campos correctos', () => {
      component.registrationForm.setValue(validForm);
      expect(component.registrationForm.valid).toBe(true);
    });

    it('debe ser inválido con email en formato incorrecto', () => {
      component.registrationForm.setValue({ ...validForm, email: 'no-es-email' });
      expect(component.registrationForm.get('email')!.hasError('email')).toBe(true);
    });

    it('debe ser inválido si las contraseñas no coinciden', () => {
      component.registrationForm.setValue({ ...validForm, confirmPassword: 'diferente' });
      expect(component.registrationForm.hasError('passwordMismatch')).toBe(true);
    });

    it('debe ser inválido si el teléfono tiene menos de 10 caracteres', () => {
      component.registrationForm.setValue({ ...validForm, phoneNumber: '300123' });
      expect(component.registrationForm.get('phoneNumber')!.hasError('minlength')).toBe(true);
    });

    it('debe ser inválido si faltan campos requeridos', () => {
      component.registrationForm.setValue({ ...validForm, names: '' });
      expect(component.registrationForm.get('names')!.hasError('required')).toBe(true);
    });
  });

  describe('onSubmit()', () => {
    it('no debe llamar a register() si el formulario es inválido', () => {
      component.onSubmit();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('debe llamar a authService.register() con los datos correctos', () => {
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      expect(mockAuthService.register).toHaveBeenCalledWith({
        firstName: 'Juan',
        lastName: 'Pérez',
        documentNumber: '1234567890',
        email: 'juan@test.com',
        phoneNumber: '3001234567',
        password: 'secret123',
      });
    });

    it('debe abrir MessageModal al registrar exitosamente', () => {
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      expect(mockDialog.open).toHaveBeenCalledTimes(1);
    });

    it('debe navegar a /login tras registro exitoso (después del timeout)', () => {
      vi.useFakeTimers();
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      vi.advanceTimersByTime(2000);
      expect(router.navigate).toHaveBeenCalledWith(['login']);
      vi.useRealTimers();
    });

    it('debe abrir MessageModal de error cuando el servidor responde 409', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' })),
      );
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      expect(mockDialog.open).toHaveBeenCalledTimes(1);
      const dialogData = mockDialog.open.mock.calls[0][1].data;
      expect(dialogData.title).toBe('Error de registro');
    });

    it('el mensaje de error 409 debe mencionar el email o documento duplicado', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' })),
      );
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      const dialogData = mockDialog.open.mock.calls[0][1].data;
      expect(dialogData.message).toContain('email');
    });

    it('NO debe navegar si el registro falla', () => {
      vi.useFakeTimers();
      mockAuthService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' })),
      );
      component.registrationForm.setValue(validForm);
      component.onSubmit();
      vi.advanceTimersByTime(2000);
      expect(router.navigate).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('hasError()', () => {
    it('debe retornar true para campo requerido tocado y vacío', () => {
      component.registrationForm.get('names')!.markAsTouched();
      expect(component.hasError('names', 'required')).toBe(true);
    });

    it('debe retornar false para campo con valor válido', () => {
      component.registrationForm.get('names')!.setValue('Juan');
      component.registrationForm.get('names')!.markAsTouched();
      expect(component.hasError('names', 'required')).toBe(false);
    });

    it('debe retornar false para campo no tocado aunque esté vacío', () => {
      expect(component.hasError('names', 'required')).toBe(false);
    });

    it('debe retornar true para email inválido tocado', () => {
      component.registrationForm.get('email')!.setValue('no-es-email');
      component.registrationForm.get('email')!.markAsTouched();
      expect(component.hasError('email', 'email')).toBe(true);
    });
  });
});
