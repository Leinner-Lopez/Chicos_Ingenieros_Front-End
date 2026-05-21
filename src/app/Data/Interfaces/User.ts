import { Role } from '../Enum/Role';
import { UserStatus } from '../Enum/UserStatus';

export interface User {
  userId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phoneNumber: string;
  status: UserStatus;
}

export interface UserDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}
