import {Component, OnInit} from '@angular/core';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@core/auth";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {AdminsRoute} from "@shared/utils";

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
    MatMenuItem
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  private _isLogged = false;
  public user = this._authService.getUserInfo();

  constructor(private _authService: AuthService,
              private _router: Router,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this._authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this._isLogged = isLoggedIn;
    });
  }

  protected _menuAdminItems = [
    {route: AdminsRoute.main, icon: 'home', routeName: 'Главная'},
    {route: AdminsRoute.clients, icon: 'apps', routeName: 'База клиентов'},
    {route: AdminsRoute.directs, icon: 'event_note', routeName: 'Расписание'},
    {route: AdminsRoute.employs, icon: 'group', routeName: 'Персонал'},
  ];

  logout() {
    this._authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      });
  }

  doLogout() {
    this._authService.removeTokens();
    // this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this._router.navigate(['/']);
  }
}
