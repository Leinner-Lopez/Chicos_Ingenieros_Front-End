import { AbstractControl } from '@angular/forms';

export function hasFormError(form: AbstractControl, controlName: string, errorType: string): boolean {
  const control = form.get(controlName);
  return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
}
