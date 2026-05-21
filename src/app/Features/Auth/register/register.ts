import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../../Shared/Utilities/PasswordValidator';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/Services/auth-service';
import { RegisterRequest } from '../../../Data/Interfaces/RegisterRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { MessageModal } from '../../../Shared/Modals/message-modal/message-modal';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  dialog = inject(Dialog);
  form = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

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
            message: 'Registro exitoso',
            title: 'Éxito',
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
              message: 'El email o el número de documento ya estan registrados.',
              title: 'Error de registro',
            },
          });
        }
        console.error('Error en el registro:', err);
      },
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.registrationForm.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
