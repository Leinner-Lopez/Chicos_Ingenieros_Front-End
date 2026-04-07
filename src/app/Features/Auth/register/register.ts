import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../../Shared/Utilities/PasswordValidator';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/Services/auth-service';
import { RegisterRequest } from '../../../Data/Interfaces/RegisterRequest';

@Component({
  selector: 'app-register',
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  form = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);


  registrationForm: FormGroup = this.form.group({
    names: ['', Validators.required],
    lastNames: ['', Validators.required],
    documentNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required, Validators.minLength(10)]],
    password: ['', [Validators.required]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  onSubmit() {
    if(this.registrationForm.invalid) return;

    const userData: RegisterRequest = {
      first_name: this.registrationForm.value.names,
      last_name: this.registrationForm.value.lastNames,
      document_number: this.registrationForm.value.documentNumber,
      email: this.registrationForm.value.email,
      phone_number: this.registrationForm.value.phone_number,
      password: this.registrationForm.value.password
    }

    this.authService.register(userData).subscribe({
      next: () => {
        console.log('Registro exitoso');
        this.router.navigate(['login']);
      },error: (err) => {
        console.error('Error en el registro:', err);
      }
    })

  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.registrationForm.get(controlName);
    return control?.hasError(errorType) && (control.dirty || control.touched) || false;
  }
}
