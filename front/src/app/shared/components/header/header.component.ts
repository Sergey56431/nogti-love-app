import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, OnInit, signal} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AuthService} from '@core/auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltip} from '@angular/material/tooltip';
import {MatBadge} from '@angular/material/badge';
import {UserInfoType} from '@shared/types';
import {createDispatchMap, select} from '@ngxs/store';
import {UsersActions, UserState} from "@core/store";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatIcon,
    MatLabel,
    MatMiniFabButton,
    RouterLink,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    MatBadge,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit{

  protected _pushCount = 0;
  protected _isLogged = signal<boolean>(false);
  protected _user = signal<UserInfoType | null>({} as UserInfoType);
  protected _isAdmin = select(UserState.getUser);

  constructor(private _authService: AuthService,
              private _snackBar: MatSnackBar,
              private _cdr: ChangeDetectorRef,) {
    };

  private _actions = createDispatchMap({
    loadUser: UsersActions.GetUser,
  });

  ngOnInit() {
    this._isLogged.set(this._authService.isLogged());
    if (this._isLogged()) {
      const userId = localStorage.getItem('userId');
      this._actions.loadUser(userId!);
    }
  }

  logout() {
    if (this._isAdmin()) {
      this._authService.logout(this._isAdmin()!._id)
        .subscribe({
          next: () => {
            this.doLogout();
          },
          error: () => {
            console.log('Ошибка выхода');
          }
        });
    }
  }

  protected _settingsUser() {
    console.log(this._isAdmin());
  }

  doLogout() {
    this._authService.removeTokens();
    this._snackBar.open('Вы успешно вышли из системы');
    window.location.reload();
  }
}
