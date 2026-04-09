import { Component, computed, inject } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { AuthService } from '../../Core/Services/auth-service';
import { MenuItem } from '../../Data/Interfaces/MenuItem';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService: AuthService = inject(AuthService);

  menuItems = computed<MenuItem[]>(() => {
    const role = this.authService.getUserRole();
    
    if (role === 'ADMIN') {
      return [
        { label: 'Inicio', icon: 'home', route: '/admin/inicio' },
        { label: 'Usuarios', icon: 'groups', route: '/admin/users' },
        { label: 'Lotes', icon: 'package_2', route: '/admin/lotes' },
        { label: 'Productos', icon: 'glass_cup', route: '/admin/productos' },
        { label: 'Categorías', icon: 'category', route: '/admin/categorias' },
        { label: 'Inventario', icon: 'inventory', route: '/admin/inventario' },
        { label: 'Historial Ventas', icon: 'article', route: '/admin/ventas' }
      ];
    }

    if (role === 'STORE') {
      return [
        { label: 'Inicio', icon: 'home', route: '/store/inicio' },
        { label: 'Lotes', icon: 'package_2', route: '/store/lotes' },
      ]
    }

    return [
      { label: 'Inicio', icon: 'home', route: '/customer/inicio' },
      { label: 'Productos', icon: 'glass_cup', route: '/customer/productos' },

    ]
  });

  logout() {
    this.authService.logout();
  }
}
