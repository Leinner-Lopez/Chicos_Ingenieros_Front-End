import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../Interfaces/User';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  saveUser(user:User):Observable<User>{
    return this.httpClient.post<User>(this.apiUrl,user);
  }

  getAllUsers():Observable<User[]>{
    return this.httpClient.get<User[]>(this.apiUrl);
  }

  findUserById(id: number):Observable<User>{
    return this.httpClient.get<User>(`${this.apiUrl}/${id}`);
  }

  findUserByEmail(email: string):Observable<User>{
    return this.httpClient.get<User>(`${this.apiUrl}/email/${email}`)
  }

  updateUser(user: User):Observable<User>{
    return this.httpClient.put<User>(this.apiUrl,user);
  }

  deleteUser(id:number):Observable<void>{
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`)
  }
}
