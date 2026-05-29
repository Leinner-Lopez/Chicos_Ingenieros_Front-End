import { Component, inject, OnInit, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { UserService } from '../../../Data/Services/user-service';
import { UserDTO } from '../../../Data/Interfaces/User';
import { UserStatus } from '../../../Data/Enum/UserStatus';
import { ModalNotificationService } from '../../../Core/Services/modal-notification.service';

@Component({
  selector: 'app-inactive-users',
  imports: [],
  templateUrl: './inactive-users.html',
  styleUrl: './inactive-users.css',
})
export class InactiveUsers implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  private readonly userService = inject(UserService);
  private readonly modalNotification = inject(ModalNotificationService);

  users = signal<UserDTO[]>([]);
  reactivated = false;

  ngOnInit(): void {
    this.loadInactiveUsers();
  }

  loadInactiveUsers(): void {
    this.userService.getUsersByStatus(UserStatus.INACTIVE).subscribe((data) => {
      this.users.set(data);
    });
  }

  reactivate(userId: number): void {
    this.userService.toggleUserStatus(userId).subscribe({
      next: () => {
        this.reactivated = true;
        this.modalNotification.showSuccess(
          'Usuario Reactivado',
          'El usuario ha sido reactivado exitosamente.',
          () => this.loadInactiveUsers(),
        );
      },
    });
  }

  closeModal(): void {
    this.dialogRef.close(this.reactivated ? 'reactivated' : undefined);
  }
}
