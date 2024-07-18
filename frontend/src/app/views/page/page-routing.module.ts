import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {ClientsComponent} from "./clients/clients.component";

const routes: Routes = [
  {path: 'main', component: MainComponent, title: 'Главная' },
  {path: 'clients', component: ClientsComponent, title: 'База клиентов' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }
