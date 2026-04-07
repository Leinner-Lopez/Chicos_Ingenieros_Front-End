import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../Data/Interfaces/LoginRequest';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../Data/Interfaces/JwtPayload';
import { RegisterRequest } from '../../Data/Interfaces/RegisterRequest';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpCLient = inject(HttpClient);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `http://localhost:8080/api/auth`;

  token = signal<string | null>(null);
  userRole = signal<string | null>(null);
  userEmail = signal<string | null>(null);
  isAuthenticated = signal<boolean>(false);

  /** Inicializa el servicio verificando el token guardado en sessionStorage y establece el estado de autenticación. */
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = sessionStorage.getItem('token');

      if (savedToken && !this.isTokenExpired(savedToken)) {
        this.token.set(savedToken);
        this.isAuthenticated.set(true);
      } else {
        this.logout();
      }
    } else {
      this.token.set(null);
      this.isAuthenticated.set(false);
    }
  }

  /** Realiza el login enviando las credenciales al servidor, guarda el token y decodifica la información del usuario. */
  login(credenciales: LoginRequest) {
    return this.httpCLient.post<{ token: string }>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('token', respuesta.token);
        }
        this.token.set(respuesta.token);
        this.isAuthenticated.set(true);
        const decodedToken: JwtPayload | null = this.decodeToken(respuesta.token);
        if (decodedToken) {
          this.userRole.set(decodedToken.role);
          this.userEmail.set(decodedToken.sub);
        }
      })
    )
  }

  register(userData: RegisterRequest) {
    return this.httpCLient.post<{ message: string }>(`${this.apiUrl}/register`, userData);
  }

  /** Cierra la sesión eliminando el token, restableciendo el estado y redirigiendo al login. */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('token');
    }
    this.token.set(null);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.userEmail.set(null);
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  /** Verifica si el token ha expirado comparando la fecha de expiración con la actual. */
  isTokenExpired(Token: string | null): boolean {
    if (!Token) return true;

    try {
      const decodedToken: any = this.decodeToken(Token);
      return Math.floor(Date.now() / 1000) >= decodedToken.exp;
    } catch (error) {
      return true;
    }
  }

  /** Decodifica el token JWT y devuelve el payload o null si falla. */
  private decodeToken(Token: string | null): JwtPayload | null {
    if (!Token) return null;
    try {
      return jwtDecode(Token);
    } catch (error) {
      return null;
    }
  }

  /** Devuelve el token de autenticación actual. */
  getToken() {
    return this.token();
  }

  /** Devuelve el rol del usuario autenticado. */
  getUserRole() {
    return this.userRole();
  }

  /** Devuelve el ID del usuario autenticado. */
  getUserEmail() {
    return this.userEmail();
  }
}
