import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../Utilities/PasswordValidator';
import { User } from '../../../Data/Interfaces/User';
import { UserStatus } from '../../../Data/Enum/UserStatus';
import { UserService } from '../../../Data/Services/user-service';
import { ModalNotificationService } from '../../../Core/Services/modal-notification.service';
import { hasFormError } from '../../Utilities/form-utils';
import { PasswordFieldset } from '../../password-fieldset/password-fieldset';
import { NameInputs } from '../../name-inputs/name-inputs';

@Component({
  selector: 'app-register-user',
  imports: [ReactiveFormsModule, PasswordFieldset, NameInputs],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  private readonly dialogRef: DialogRef<string> = inject(DialogRef);
  private readonly form = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly modalNotification = inject(ModalNotificationService);

  registrationForm: FormGroup;

  constructor(@Inject(DIALOG_DATA) public data: any) {
    const isEditMode = !!data?.userId;

    this.registrationForm = this.form.group(
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
        password: ['', isEditMode ? [] : [Validators.required]],
        confirmPassword: ['', isEditMode ? [] : Validators.required],
      },
      { validators: passwordMatchValidator },
    );

    if (isEditMode) {
      this.registrationForm.get('documentNumber')?.disable();
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
    }
  }

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
        next: () =>
          this.modalNotification.showSuccess(
            'Usuario Actualizado',
            'El usuario ha sido actualizado exitosamente.',
            () => this.closeModal(),
          ),
      });
      return;
    }

    this.userService.saveUser(userData).subscribe({
      next: () =>
        this.modalNotification.showSuccess(
          'Usuario Registrado',
          'El usuario ha sido registrado exitosamente.',
          () => this.closeModal(),
        ),
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasFormError(this.registrationForm, controlName, errorType);
  }

  closeModal(): void {
    this.dialogRef.close('Usuario registrado');
  }
}
