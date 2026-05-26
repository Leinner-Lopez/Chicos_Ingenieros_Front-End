import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../Utilities/PasswordValidator';
import { MessageModal } from '../message-modal/message-modal';
import { User } from '../../../Data/Interfaces/User';
import { UserStatus } from '../../../Data/Enum/UserStatus';
import { UserService } from '../../../Data/Services/user-service';

@Component({
  selector: 'app-register-user',
  imports: [ReactiveFormsModule],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  dialog = inject(Dialog);
  dialogRef: DialogRef<string> = inject(DialogRef);
  form = inject(FormBuilder);
  userService = inject(UserService);

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data?.userId) {
      this.userService.findUserById(data.userId).subscribe((user: User) => {
        this.registrationForm.patchValue({
          names: user.firstName,
          lastNames: user.lastName,
          documentNumber: user.documentNumber,
          email: user.email,
          userRole: user.role,
          phoneNumber: user.phoneNumber,
        });
      });
      this.registrationForm.get('documentNumber')?.disable();
      this.registrationForm.get('password')?.clearValidators();
      this.registrationForm.get('password')?.updateValueAndValidity();
      this.registrationForm.get('confirmPassword')?.clearValidators();
      this.registrationForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  registrationForm: FormGroup = this.form.group(
    {
      names: ['', Validators.required],
      lastNames: ['', Validators.required],
      documentNumber: [
        null,
        [Validators.required, Validators.min(10000000), Validators.max(9999999999)],
      ],
      email: ['', [Validators.required, Validators.email]],
      userRole: ['', Validators.required],
      phoneNumber: [
        null,
        [Validators.required, Validators.min(1000000000), Validators.max(9999999999)],
      ],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit() {
    if (this.registrationForm.invalid) return;

    const formValue = this.registrationForm.getRawValue();

    const userData: User = {
      userId: null!,
      firstName: formValue.names,
      lastName: formValue.lastNames,
      documentNumber: formValue.documentNumber,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      password: formValue.password,
      role: formValue.userRole,
      status: UserStatus.ACTIVE,
    };

    if (this.data?.userId) {
      userData.userId = this.data.userId;
      this.userService.updateUser(userData).subscribe({
        next: () => {
          const dialogRef = this.dialog.open<string>(MessageModal, {
            data: {
              title: 'Usuario Actualizado',
              message: 'El usuario ha sido actualizado exitosamente.',
            },
          });
          setTimeout(() => {
            dialogRef.close();
            this.closeModal();
          }, 1500);
        },
      });
      return;
    }

    this.userService.saveUser(userData).subscribe({
      next: () => {
        const dialogRef = this.dialog.open<string>(MessageModal, {
          data: {
            title: 'Usuario Registrado',
            message: 'El usuario ha sido registrado exitosamente.',
          },
        });
        setTimeout(() => {
          dialogRef.close();
          this.closeModal();
        }, 1500);
      },
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.registrationForm.get(controlName);
    return (control?.hasError(errorType) && (control.dirty || control.touched)) || false;
  }

  closeModal(): void {
    this.dialogRef.close('Usuario registrado');
  }
}
