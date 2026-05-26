import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly KEY = 'token';
  private readonly platformId = inject(PLATFORM_ID);

  save(token: string): void {
    if (isPlatformBrowser(this.platformId)) sessionStorage.setItem(this.KEY, token);
  }

  get(): string | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage.getItem(this.KEY) : null;
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) sessionStorage.removeItem(this.KEY);
  }
}
