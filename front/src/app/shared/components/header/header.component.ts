import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInfoType } from '@shared/types';
import { createDispatchMap } from '@ngxs/store';
import { UsersActions } from '@core/store';
import { PrimeIcons } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { BadgeDirective } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    Menu,
    BadgeDirective,
    Button,
    Tooltip,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  protected _pushCount = 3;
  protected _isLogged = signal<boolean>(false);
  protected _user: Signal<UserInfoType> = computed(() => {
    return this._authService.getUserInfo();
  });

  protected _userMenu = [
    {
      path: '',
      label: 'Настройки',
      icon: PrimeIcons.COG,
      command: () => {
        this._settingsUser();
      },
    },
    {
      path: '',
      label: 'Выйти',
      icon: PrimeIcons.SIGN_OUT,
      command: () => {
        this.logout();
      },
    },
  ];

  constructor(
    private _authService: AuthService,
    private _snackBar: MatSnackBar,
  ) {}

  private _actions = createDispatchMap({
    loadUser: UsersActions.GetUser,
  });

  ngOnInit() {
    this._isLogged.set(this._authService.isLogged());
    if (this._isLogged()) {
      // const userId = localStorage.getItem('userId');
      // this._actions.loadUser(userId!);
    }
  }

  logout() {
    if (this._user()) {
      console.log(this._user());
      this._authService.logout(this._user().userId).subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          console.log('Ошибка выхода');
        },
      });
    }
  }

  protected _settingsUser() {
    console.log(this._user());
  }

  doLogout() {
    this._authService.removeTokens();
    this._snackBar.open('Вы успешно вышли из системы');
    window.location.reload();
  }
}
