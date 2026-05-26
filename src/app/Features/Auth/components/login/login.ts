import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../Core/Services/auth-service';
import { LoginRequest } from '../../../../Data/Interfaces/LoginRequest';
import { Dialog } from '@angular/cdk/dialog';
import { MessageModal } from '../../../../Shared/Modals/message-modal/message-modal';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  dialog = inject(Dialog);
  form = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  formularioLogin: FormGroup = this.form.group({
    Username: ['', [Validators.required, Validators.email]],
    Password: ['', Validators.required],
  });

  onSubmit() {
    if (this.formularioLogin.invalid) return;
    const credentials: LoginRequest = {
      username: this.formularioLogin.value.Username,
      password: this.formularioLogin.value.Password,
    };
    this.authService.login(credentials).subscribe({
      next: () => this.router.navigate([this.authService.getHomeRoute()]),
      error: (err) => {
        this.dialog.open<string>(MessageModal, {
          data: {
            title: 'Error de autenticación',
            message: 'Email o contraseña incorrectos. Por favor, inténtelo de nuevo.',
          },
        });
      },
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioLogin.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }
}
