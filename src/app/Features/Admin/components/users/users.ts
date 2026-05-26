import { Component, OnInit, signal, inject } from '@angular/core';
import { UserService } from '../../../../Data/Services/user-service';
import { UserDTO } from '../../../../Data/Interfaces/User';
import { Dialog } from '@angular/cdk/dialog';
import { RegisterUser } from '../../../../Shared/Modals/register-user/register-user';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';

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
    this.getUsers();
  }

  getUsers() {
    this.userService.getAllUsers().subscribe((data) => {
      this.users.set(data);
    });
    this.userService.getCountUsers().subscribe((data) => {
      this.usersNumber.set(data);
    });
  }

  registerUser(): void {
    const dialogRef = this.dialog.open(RegisterUser, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'Usuario registrado') {
        this.getUsers();
      }
    });
  }

  updateUser(userId: number): void {
    const dialogRef = this.dialog.open(RegisterUser, {
      data: { userId },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Usuario registrado') {
        this.getUsers();
      }
    });
  }

  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open<string>(ConfirmModal, {
      data: {
        message: '¿Deseas eliminar este usuario?',
        successTitle: 'Usuario Eliminado',
        successMessage: 'El usuario ha sido eliminado exitosamente.',
        onConfirm: () => this.userService.deleteUser(userId),
      },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Eliminación Exitosa') this.getUsers();
    });
  }
}
