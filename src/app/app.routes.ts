import { Routes } from '@angular/router';
import { Login } from './Features/Auth/components/login/login';
import { Register } from './Features/Auth/components/register/register';
import { Layout } from './Shared/layout/layout';
import { authGuard } from './Core/Guards/auth-guard';
import { roleGuard } from './Core/Guards/role-guard';
import { InicioAdmin } from './Features/Admin/components/inicio/inicio';
import { Users } from './Features/Admin/components/users/users';
import { Lots } from './Shared/lots/lots';
import { Products } from './Features/Admin/components/products/products';
import { Categories } from './Features/Admin/components/categories/categories';
import { Inventory } from './Features/Admin/components/inventory/inventory';
import { SalesHistory } from './Features/Admin/components/sales-history/sales-history';
import { InicioStore } from './Features/Store/components/inicio/inicio';
import { InicioCustomer } from './Features/Customer/components/inicio/inicio';
import { ProductsCustomer } from './Features/Customer/components/products/products';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'admin',
    component: Layout,
    canActivate: [authGuard, roleGuard],
    data: { rol: ['ADMIN'] },
    children: [
      { path: 'inicio', component: InicioAdmin },
      { path: 'users', component: Users },
      { path: 'lotes', component: Lots },
      { path: 'productos', component: Products },
      { path: 'categorias', component: Categories },
      { path: 'inventario', component: Inventory },
      { path: 'ventas', component: SalesHistory },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  {
    path: 'store',
    component: Layout,
    canActivate: [authGuard, roleGuard],
    data: { rol: ['STORE'] },
    children: [
      { path: 'inicio', component: InicioStore },
      { path: 'lotes', component: Lots },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  {
    path: 'customer',
    component: Layout,
    canActivate: [authGuard, roleGuard],
    data: { rol: ['CUSTOMER'] },
    children: [
      { path: 'inicio', component: InicioCustomer },
      { path: 'productos', component: ProductsCustomer },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
