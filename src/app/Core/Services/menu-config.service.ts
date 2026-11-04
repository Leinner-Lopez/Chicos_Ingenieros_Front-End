import { Injectable } from '@angular/core';
import { MenuItem } from '../../Data/Interfaces/MenuItem';

@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  private readonly menuByRole: Record<string, MenuItem[]> = {
    ADMIN: [
      { label: 'menu.home', icon: 'home', route: '/admin/inicio' },
      { label: 'menu.users', icon: 'groups', route: '/admin/users' },
      { label: 'menu.lots', icon: 'package_2', route: '/admin/lotes' },
      { label: 'menu.products', icon: 'glass_cup', route: '/admin/productos' },
      { label: 'menu.categories', icon: 'category', route: '/admin/categorias' },
      { label: 'menu.inventory', icon: 'inventory', route: '/admin/inventario' },
      { label: 'menu.sales', icon: 'article', route: '/admin/ventas' },
      { label: 'menu.backup', icon: 'backup', route: '/admin/backup'}
    ],
    STORE: [
      { label: 'menu.home', icon: 'home', route: '/store/inicio' },
      { label: 'menu.lots', icon: 'package_2', route: '/store/lotes' },
    ],
    CUSTOMER: [
      { label: 'menu.home', icon: 'home', route: '/customer/inicio' },
      { label: 'menu.products', icon: 'glass_cup', route: '/customer/productos' },
    ],
  };

  getMenuByRole(role: string | null): MenuItem[] {
    return this.menuByRole[role ?? ''] ?? [];
  }
}
