import {Component} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf, NgStyle} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '@core/auth';
import {DefaultResponseType, LoginResponseType, UserInfoType} from '@shared/types';
// import {select} from '@ngxs/store';
// import {AuthState} from '@core/store/auth/auth.state';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgStyle
  ],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {

  // private _login = select(AuthState.getAuthData);
  protected _loginForm = this._fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    rememberMe: false
  });

  constructor(private _fb: FormBuilder,
              private _authService: AuthService,
              private _router: Router,
              private _snackBar: MatSnackBar) {
  }

  get username() {
    return this._loginForm.get('username');
  }

  get password() {
    return this._loginForm.get('password');
  }

  login() {
    if (this._loginForm.valid && this._loginForm.value.username && this._loginForm.value.password) {
      this._authService.login(this._loginForm.value.username, this._loginForm.value.password)
        .subscribe({
          next: (data: LoginResponseType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              this._snackBar.open('Ошибка при авторизации');
              throw new Error(data.message ? data.message : 'Error with data on login');
            }
            if (data as LoginResponseType) {
              const loginResponse = data as LoginResponseType;
              if (!loginResponse.accessToken || loginResponse.error) {
                this._snackBar.open('Что-то пошло не так');
              } else {
                this._authService.setTokens(loginResponse.accessToken);
                this._authService.getUser(loginResponse.id) .subscribe((user: UserInfoType) => {
                  this._authService.setUserInfo(user);
                });
                this._router.navigate(['/main']);
              }
            }
          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при авторизации');
            throw new Error(error.error.message);
          }
        });
    }
  }
}


