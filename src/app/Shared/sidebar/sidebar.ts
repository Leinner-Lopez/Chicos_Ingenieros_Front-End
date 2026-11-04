import { Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { AuthService } from '../../Core/Services/auth-service';
import { MenuConfigService } from '../../Core/Services/menu-config.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, LanguageSwitcher],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);
  menuConfigService = inject(MenuConfigService);

  menuItems = computed(() => this.menuConfigService.getMenuByRole(this.authService.getUserRole()));

  logout() {
    this.authService.logout();
  }
}
