import { Role } from "../Enum/Role";
import { UserStatus } from "../Enum/UserStatus";

export interface User{
    user_id:number,
    document_number:string,
    first_name:string,
    last_name:string,
    email:string,
    password:string,
    role:Role,
    status:UserStatus
}