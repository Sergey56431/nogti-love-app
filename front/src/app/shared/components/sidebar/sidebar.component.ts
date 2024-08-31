import {Component, signal} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AdminsRoute} from '@shared/utils';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    RouterLink,
    RouterLinkActive,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatTooltip
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  protected _menuOpen = signal(true);

  protected _menuVis(){
    this._menuOpen.set(!this._menuOpen());
  }
  protected _menuAdminItems = [
    {route: AdminsRoute.main, icon: 'home', routeName: 'Главная'},
    {route: AdminsRoute.clients, icon: 'apps', routeName: 'База клиентов'},
    {route: AdminsRoute.schedule, icon: 'event_note', routeName: 'Расписание'},
    {route: AdminsRoute.employs, icon: 'group', routeName: 'Персонал'},
  ];
}
