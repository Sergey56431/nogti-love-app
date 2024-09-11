import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AuthService} from '@core/auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTooltip} from '@angular/material/tooltip';
import {MatBadge} from '@angular/material/badge';

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
  public user = this._authService.getUserInfo();

  constructor(private _authService: AuthService,
              private _router: Router,
              private _snackBar: MatSnackBar,) {
  }

  ngOnInit() {
      this._isLogged.set(this._authService.isLogged());
      console.log(this._isLogged());
  }

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
    window.location.reload();
  }
}
