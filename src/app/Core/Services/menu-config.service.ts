import { Injectable } from '@angular/core';
import { MenuItem } from '../../Data/Interfaces/MenuItem';

@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  private readonly menuByRole: Record<string, MenuItem[]> = {
    ADMIN: [
      { label: 'Inicio', icon: 'home', route: '/admin/inicio' },
      { label: 'Usuarios', icon: 'groups', route: '/admin/users' },
      { label: 'Lotes', icon: 'package_2', route: '/admin/lotes' },
      { label: 'Productos', icon: 'glass_cup', route: '/admin/productos' },
      { label: 'Categorías', icon: 'category', route: '/admin/categorias' },
      { label: 'Inventario', icon: 'inventory', route: '/admin/inventario' },
      { label: 'Ventas', icon: 'article', route: '/admin/ventas' },
    ],
    STORE: [
      { label: 'Inicio', icon: 'home', route: '/store/inicio' },
      { label: 'Lotes', icon: 'package_2', route: '/store/lotes' },
    ],
    CUSTOMER: [
      { label: 'Inicio', icon: 'home', route: '/customer/inicio' },
      { label: 'Productos', icon: 'glass_cup', route: '/customer/productos' },
    ],
  };

  getMenuByRole(role: string | null): MenuItem[] {
    return this.menuByRole[role ?? ''] ?? [];
  }
}
