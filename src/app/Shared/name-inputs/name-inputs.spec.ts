import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { NameInputs } from './name-inputs';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <form [formGroup]="form">
      <app-name-inputs />
    </form>
  `,
  imports: [ReactiveFormsModule, NameInputs],
})
class TestHostComponent {
  form: FormGroup = new FormBuilder().group({
    names: ['', Validators.required],
    lastNames: ['', Validators.required],
  });
}

describe('NameInputs', () => {
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
    const comp = fixture.debugElement.query(By.directive(NameInputs));
    expect(comp).not.toBeNull();
  });

  it('debe renderizar los campos names y lastNames', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(2);
  });

  it('debe mostrar el error de campo requerido en names cuando está tocado y vacío', () => {
    host.form.get('names')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    expect(errors.length).toBeGreaterThan(0);
    const texts = Array.from(errors).map((e: any) => e.textContent.trim());
    expect(texts).toContain('El campo es requerido');
  });

  it('debe mostrar el error en lastNames cuando está tocado y vacío', () => {
    host.form.get('lastNames')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('no debe mostrar errores cuando los campos están intactos', () => {
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    expect(errors.length).toBe(0);
  });

  it('no debe mostrar errores cuando los campos tienen valores válidos', () => {
    host.form.get('names')!.setValue('Juan');
    host.form.get('names')!.markAsTouched();
    host.form.get('lastNames')!.setValue('Pérez');
    host.form.get('lastNames')!.markAsTouched();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.error__message');
    expect(errors.length).toBe(0);
  });
});
