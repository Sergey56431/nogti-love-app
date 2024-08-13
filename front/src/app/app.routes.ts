import {Routes} from '@angular/router';
import {LayoutComponent} from "./shared/layout/layout.component";
import {AuthGuard} from "./core/auth/auth.guard";
import {AuthForvardGuard} from "./core/auth/auth-forvard.guard";

export const routes: Routes = [
  {path: '', redirectTo: 'main', pathMatch: 'full'},

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'main',
        loadComponent:() => import('./views/page').then(c => c.MainComponent),
        title: 'Главная'
      },
      {
        path: 'clients',
        loadComponent:() => import('./views/page').then(c => c.ClientsPageComponent),
        title: 'Клиенты'
      },
    ]
  },
  {
    path: 'login',
    canActivate: [AuthForvardGuard],
    loadComponent: () => import('./views/users/login-page/login-page.component').then(c => c.LoginPageComponent),
    title: 'Вход в систему'
  },
  {
    path: 'registration',
    canActivate: [AuthForvardGuard],
    loadComponent: () => import('./views/users/registration-page/registration-page.component').then(c => c.RegistrationPageComponent),
    title: 'Регистрация'
  },
];
