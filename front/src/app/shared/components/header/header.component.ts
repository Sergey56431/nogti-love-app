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
import {AuthState} from '@core/store/auth/auth.state';
import {AuthData} from '@core/store/auth/auth.actions';


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

  protected _isLogged = signal<boolean>(false);
  protected _user = signal<UserInfoType | null>({} as UserInfoType);
  protected _isAdmin = select(AuthState.getUserInfo);

  constructor(private _authService: AuthService,
              private _snackBar: MatSnackBar,
              private _cdr: ChangeDetectorRef,) {
    };

  private _actions = createDispatchMap({
    loadUser: AuthData.GetUser,
  });

  ngOnInit() {
    this._isLogged.set(this._authService.isLogged());
    if (this._isLogged()) {
      // setTimeout(() => { //временное решение нужно найти причину почему не подгружается информация от сервера
        this._user.set(this._authService.getUserInfo());
      // }, 500); // перейти на использование стаейт менеджера

    }
  }

  logout() {
    if (this._user()) {
      this._authService.logout(this._user()!._id)
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
    this._actions.loadUser(this._user()!._id);
    console.log(this._isAdmin());

  }

  doLogout() {
    this._authService.removeTokens();
    this._snackBar.open('Вы успешно вышли из системы');
    window.location.reload();
  }
}
