import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from "./shared/layout/layout.component";
import {AuthGuard} from "./core/auth/auth.guard";
import {AuthForvardGuard} from "./core/auth/auth-forvard.guard";

const routes: Routes = [
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: '', loadChildren: () => import('./views/user/user.module').then(m => m.UserModule), canActivate:[AuthForvardGuard]},
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', loadChildren: () => import('./views/page/page.module').then(m => m.PageModule),
        canActivate: [AuthGuard]},
    ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
