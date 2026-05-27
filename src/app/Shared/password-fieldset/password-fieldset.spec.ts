import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { passwordMatchValidator } from '../Utilities/PasswordValidator';
import { PasswordFieldset } from './password-fieldset';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <form [formGroup]="form">
      <app-password-fieldset />
    </form>
  `,
  imports: [ReactiveFormsModule, PasswordFieldset],
})
class TestHostComponent {
  form: FormGroup = new FormBuilder().group(
    {
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );
}

describe('PasswordFieldset', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe ser creado dentro de un FormGroup padre', () => {
    const fieldset = fixture.debugElement.query(By.directive(PasswordFieldset));
    expect(fieldset).not.toBeNull();
  });

  it('debe renderizar los campos password y confirmPassword', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(2);
  });

  it('debe mostrar el error de campo requerido en password cuando está tocado y vacío', () => {
    host.form.get('password')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    const texts = Array.from(errors).map((e: any) => e.textContent.trim());
    expect(texts).toContain('El campo es requerido');
  });

  it('no debe mostrar errores cuando los campos están intactos', () => {
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    expect(errors.length).toBe(0);
  });

  it('debe mostrar el error de contraseñas no coinciden una sola vez bajo confirmPassword', () => {
    host.form.get('password')!.setValue('pass123');
    host.form.get('confirmPassword')!.setValue('otracosa');
    host.form.get('confirmPassword')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    const matching = Array.from(errors).filter((e: any) =>
      e.textContent.trim().includes('no coinciden'),
    );
    expect(matching.length).toBe(1);
  });

  it('no debe mostrar error de passwordMismatch cuando las contraseñas coinciden', () => {
    host.form.get('password')!.setValue('pass123');
    host.form.get('confirmPassword')!.setValue('pass123');
    host.form.get('confirmPassword')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    const texts = Array.from(errors).map((e: any) => e.textContent.trim());
    expect(texts.some((t) => t.includes('no coinciden'))).toBe(false);
  });
});
