import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminsRoute } from '@shared/utils';
import { PrimeIcons } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLink,
    RouterLinkActive,
    Tooltip,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected _menuOpen = signal(true);

  protected _menuVis() {
    this._menuOpen.set(!this._menuOpen());
  }

  protected _menuAdminItems = [
    { route: AdminsRoute.main, icon: PrimeIcons.HOME, routeName: 'Главная' },
    {
      route: AdminsRoute.clients,
      icon: PrimeIcons.DATABASE,
      routeName: 'База клиентов',
    },
    {
      route: AdminsRoute.schedule,
      icon: PrimeIcons.CALENDAR,
      routeName: 'Расписание',
    },
    {
      route: AdminsRoute.favors,
      icon: PrimeIcons.TAGS,
      routeName: 'Услуги',
    },
    {
      route: AdminsRoute.operations,
      icon: PrimeIcons.WALLET,
      routeName: 'Операции',
    },
  ];
}
