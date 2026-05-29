import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User, UserDTO } from '../Interfaces/User';
import { UserStatus } from '../Enum/UserStatus';
import { Observable } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/users`;

  saveUser(user: User): Observable<User> {
    return this.httpClient.post<User>(this.apiUrl, user);
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.httpClient.get<UserDTO[]>(this.apiUrl);
  }

  getUsersByStatus(status: UserStatus): Observable<UserDTO[]> {
    return this.httpClient.get<UserDTO[]>(`${this.apiUrl}/status/${status}`);
  }

  getCountUsers(): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count`);
  }

  getCountUsersByStatus(status: UserStatus): Observable<number> {
    return this.httpClient.get<number>(`${this.apiUrl}/count/status/${status}`);
  }

  findUserById(id: number): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/${id}`);
  }

  findUserByEmail(email: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/email/${email}`);
  }

  updateUser(user: User): Observable<User> {
    return this.httpClient.put<User>(this.apiUrl, user);
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.httpClient.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
