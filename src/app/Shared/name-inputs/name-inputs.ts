import { Component, inject } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { hasFormError } from '../Utilities/form-utils';

@Component({
  selector: 'app-name-inputs',
  imports: [ReactiveFormsModule],
  templateUrl: './name-inputs.html',
  styleUrl: '../../Features/Auth/components/register/register.css',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class NameInputs {
  private readonly formGroupDirective = inject(FormGroupDirective);

  get form() {
    return this.formGroupDirective.form;
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasFormError(this.form, controlName, errorType);
  }
}
