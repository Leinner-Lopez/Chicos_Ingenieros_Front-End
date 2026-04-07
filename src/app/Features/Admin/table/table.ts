import { Component, inject } from '@angular/core';
import { UserService } from '../../../Data/Services/user-service';
import { User } from '../../../Data/Interfaces/User';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  userService = inject(UserService);
  usuarios:User[] = [];

  
}
