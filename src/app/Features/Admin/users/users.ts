import { Component, OnInit, signal, inject } from '@angular/core';
import { UserService } from '../../../Data/Services/user-service';
import { UserDTO } from '../../../Data/Interfaces/User';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
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
}
