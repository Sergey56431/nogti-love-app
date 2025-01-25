import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AdminsRoute} from '@shared/utils';
import {MatTooltip} from '@angular/material/tooltip';
import { PrimeIcons } from 'primeng/api';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    RouterLink,
    RouterLinkActive,
    MatTooltip
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {

  protected _menuOpen = signal(true);

  protected _menuVis(){
    this._menuOpen.set(!this._menuOpen());
  }
  protected _menuAdminItems = [
    {route: AdminsRoute.main, icon: PrimeIcons.HOME, routeName: 'Главная'},
    {route: AdminsRoute.clients, icon: PrimeIcons.DATABASE, routeName: 'База клиентов'},
    {route: AdminsRoute.schedule, icon: PrimeIcons.CALENDAR, routeName: 'Расписание'},
    {route: AdminsRoute.employs, icon: PrimeIcons.USERS, routeName: 'Персонал'},
    {route: AdminsRoute.operations, icon: PrimeIcons.WALLET, routeName: 'Операции'},
  ];
}
