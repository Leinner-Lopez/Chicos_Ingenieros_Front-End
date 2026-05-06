import { Role } from '../Enum/Role';
import { UserStatus } from '../Enum/UserStatus';

export interface User {
  user_id: number;
  documentNumber: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: Role;
  phone_number: string;
  status: UserStatus;
}

export interface UserDTO {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
}
