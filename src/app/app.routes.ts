import { Routes } from '@angular/router';
import { Login } from './Features/Auth/login/login';
import { Register } from './Features/Auth/register/register';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
];
