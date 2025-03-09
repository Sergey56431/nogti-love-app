import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/layout/layout.component';
import { AuthForvardGuard, AuthGuard } from '@core/auth';
import { NotFoundComponent } from '@views/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'main',
        loadComponent: () => import('./views').then((c) => c.MainComponent),
        title: 'Главная',
      },
      {
        path: 'settings',
        loadComponent:() => import('./views').then(c => c.SettingsPageComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./views').then((c) => c.ClientsPageComponent),
        title: 'Клиенты',
      },

      {
        path: 'clients/:id',
        title: 'Клиент',
        loadComponent: () =>
          import('./views').then((c) => c.ClientDetailComponent),
      },

      {
        path: 'schedule',
        loadComponent: () =>
          import('./views').then((c) => c.SchedulePageComponent),
        title: 'Расписание',
      },

      {
        path: 'schedule/:action',
        loadComponent: () =>
          import('./views').then((c) => c.ScheduleEditComponent),
      },
      {
        path: 'favors',
        loadComponent: () =>
          import('./views').then((c) => c.FavorsPageComponent),
        title: 'Услуги',
      },
      {
        path: 'employs',
        loadComponent: () =>
          import('./views').then((c) => c.EmployesPageComponent),
        title: 'Персонал',
      },
      {
        path: 'operations',
        loadComponent: () =>
          import('./views').then((c) => c.AllTransationsPageComponent),
        title: 'Операции',
      },
      {
        path: 'all-transactions',
        loadComponent: () => import('./views').then((c) => c.AllTransationsPageComponent),
        title: 'Список операций',
      },
      {
        path: 'category-operations/:category',
        loadComponent: () => import('./views').then((c) => c.AllTransationsPageComponent),
        title: 'Список операций',
      },
      {
        path: 'category-operations',
        loadComponent: () => import('./views').then((c) => c.OperationsCategoryComponent),
        title: 'Категории операций',
      },
      {
        path: 'transactions-details/:id',
        loadComponent: () => import('./views').then((c) => c.TransactionsDetailsComponent),
        title: 'Детали операции',
      },
    ],
  },
  {
    path: 'login',
    canActivate: [AuthForvardGuard],
    loadComponent: () => import('./views').then((c) => c.LoginPageComponent),
    title: 'Вход в систему',
  },
  {
    path: 'registration',
    canActivate: [AuthForvardGuard],
    loadComponent: () =>
      import('./views').then((c) => c.RegistrationPageComponent),
    title: 'Регистрация',
  },

  { path: '**', component: NotFoundComponent },
];
