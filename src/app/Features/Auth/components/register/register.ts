import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../../../Shared/Utilities/PasswordValidator';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../Core/Services/auth-service';
import { RegisterRequest } from '../../../../Data/Interfaces/RegisterRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { MessageModal } from '../../../../Shared/Modals/message-modal/message-modal';
import { PasswordFieldset } from '../../../../Shared/password-fieldset/password-fieldset';
import { NameInputs } from '../../../../Shared/name-inputs/name-inputs';
import { hasFormError } from '../../../../Shared/Utilities/form-utils';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcher } from '../../../../Shared/language-switcher/language-switcher';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, PasswordFieldset, NameInputs, TranslocoPipe, LanguageSwitcher],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly dialog = inject(Dialog);
  private readonly form = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly t = inject(TranslocoService);

  registrationForm: FormGroup = this.form.group(
    {
      names: ['', Validators.required],
      lastNames: ['', Validators.required],
      documentNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit() {
    if (this.registrationForm.invalid) return;

    const userData: RegisterRequest = {
      firstName: this.registrationForm.value.names,
      lastName: this.registrationForm.value.lastNames,
      documentNumber: this.registrationForm.value.documentNumber,
      email: this.registrationForm.value.email,
      phoneNumber: this.registrationForm.value.phoneNumber,
      password: this.registrationForm.value.password,
    };

    this.authService.register(userData).subscribe({
      next: () => {
        const dialogRef = this.dialog.open(MessageModal, {
          data: {
            message: this.t.translate('auth.registerSuccess'),
            title: this.t.translate('common.success'),
          },
        });
        setTimeout(() => {
          dialogRef.close();
          this.router.navigate(['login']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.dialog.open<string>(MessageModal, {
            data: {
              message: this.t.translate('auth.alreadyRegistered'),
              title: this.t.translate('auth.registerErrorTitle'),
            },
          });
        }
        console.error('Error en el registro:', err);
      },
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasFormError(this.registrationForm, controlName, errorType);
  }
}
