import { Component, OnInit, signal, inject } from '@angular/core';
import { UserService } from '../../../../Data/Services/user-service';
import { UserDTO } from '../../../../Data/Interfaces/User';
import { UserStatus } from '../../../../Data/Enum/UserStatus';
import { Dialog } from '@angular/cdk/dialog';
import { RegisterUser } from '../../../../Shared/Modals/register-user/register-user';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';
import { InactiveUsers } from '../../../../Shared/Modals/inactive-users/inactive-users';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  dialog = inject(Dialog);
  userService: UserService = inject(UserService);
  users = signal<UserDTO[]>([]);
  usersNumber = signal<number>(0);

  ngOnInit(): void {
    this.loadActiveUsers();
  }

  loadActiveUsers(): void {
    this.userService.getUsersByStatus(UserStatus.ACTIVE).subscribe((data) => {
      this.users.set(data);
    });
    this.userService.getCountUsersByStatus(UserStatus.ACTIVE).subscribe((data) => {
      this.usersNumber.set(data);
    });
  }

  registerUser(): void {
    const dialogRef = this.dialog.open(RegisterUser, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'Usuario registrado') this.loadActiveUsers();
    });
  }

  updateUser(userId: number): void {
    const dialogRef = this.dialog.open(RegisterUser, { data: { userId } });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Usuario registrado') this.loadActiveUsers();
    });
  }

  deactivateUser(userId: number): void {
    const dialogRef = this.dialog.open<string>(ConfirmModal, {
      data: {
        message: '¿Deseas desactivar este usuario?',
        successTitle: 'Usuario Desactivado',
        successMessage: 'El usuario ha sido desactivado exitosamente.',
        onConfirm: () => this.userService.toggleUserStatus(userId),
      },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Eliminación Exitosa') this.loadActiveUsers();
    });
  }

  openInactiveUsers(): void {
    const dialogRef = this.dialog.open(InactiveUsers, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'reactivated') this.loadActiveUsers();
    });
  }
}
