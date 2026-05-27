import { FormControl, FormGroup } from '@angular/forms';
import { hasFormError } from './form-utils';

describe('hasFormError', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup({
      name: new FormControl('', { validators: [] }),
      email: new FormControl(''),
    });
  });

  it('debe retornar false cuando el control no tiene el error', () => {
    expect(hasFormError(form, 'name', 'required')).toBe(false);
  });

  it('debe retornar false cuando el control tiene el error pero no está tocado ni sucio', () => {
    form.get('name')!.setErrors({ required: true });
    expect(hasFormError(form, 'name', 'required')).toBe(false);
  });

  it('debe retornar true cuando el control tiene el error y está tocado', () => {
    form.get('name')!.setErrors({ required: true });
    form.get('name')!.markAsTouched();
    expect(hasFormError(form, 'name', 'required')).toBe(true);
  });

  it('debe retornar true cuando el control tiene el error y está sucio', () => {
    form.get('name')!.setErrors({ required: true });
    form.get('name')!.markAsDirty();
    expect(hasFormError(form, 'name', 'required')).toBe(true);
  });

  it('debe retornar false para un tipo de error distinto al que tiene el control', () => {
    form.get('name')!.setErrors({ required: true });
    form.get('name')!.markAsTouched();
    expect(hasFormError(form, 'name', 'email')).toBe(false);
  });

  it('debe retornar false cuando el control no existe en el formulario', () => {
    expect(hasFormError(form, 'campoInexistente', 'required')).toBe(false);
  });
});
