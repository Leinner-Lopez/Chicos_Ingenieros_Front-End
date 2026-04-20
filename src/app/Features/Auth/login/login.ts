import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/Services/auth-service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../../Data/Interfaces/LoginRequest';
import { Dialog } from '@angular/cdk/dialog';
import { MessageModal } from '../../../Shared/Modals/message-modal/message-modal';

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
    Password: ['', Validators.required]
  })

  onSubmit() {
    if (this.formularioLogin.invalid) return;
    const credentials: LoginRequest = {
      username: this.formularioLogin.value.Username,
      password: this.formularioLogin.value.Password
    }
    this.authService.login(credentials).subscribe({
      next: () => {
        const role = this.authService.getUserRole();
        this.redirectByUserRole(role);
      }, error: (err) => {
        this.dialog.open<string>(MessageModal,{
          data:{
            title: 'Error de autenticación',
            message: 'Email o contraseña incorrectos. Por favor, inténtelo de nuevo.'
          }
        })
      }
    })
  }

  private redirectByUserRole(role: string | null) {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/inicio']);
        break;
      case 'CUSTOMER':
        this.router.navigate(['/customer/inicio']);
        break;
      case 'STORE':
        this.router.navigate(['/store/inicio']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.formularioLogin.get(controlName);
    return control?.hasError(errorType) && (control.dirty || control.touched) || false;
  }
}
