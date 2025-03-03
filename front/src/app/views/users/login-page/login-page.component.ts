import {Component} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf, NgStyle} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '@core/auth';
import {DefaultResponseType, LoginResponseType} from '@shared/types';

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

  protected _loginForm = this._fb.group({
    phoneNumber: ['', [Validators.required]],
    // password: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: false
  });

  constructor(private _fb: FormBuilder,
              private _authService: AuthService,
              private _router: Router,
              private _snackBar: MatSnackBar) {
  }

  get phoneNumber() {
    return this._loginForm.get('phoneNumber');
  }

  get password() {
    return this._loginForm.get('password');
  }

  login() {
    if (this._loginForm.valid && this._loginForm.value.phoneNumber && this._loginForm.value.password) {
      this._authService.login(this._loginForm.value.phoneNumber, this._loginForm.value.password)
        .subscribe({
          next: (data: LoginResponseType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              this._snackBar.open('Ошибка при авторизации');
              throw new Error((data as DefaultResponseType).message);
            }
            if (data as LoginResponseType) {
              const loginResponse = data as LoginResponseType;

                this._authService.setTokens(loginResponse.access_token);
                this._authService.setUserInfo({
                  phoneNumber: loginResponse.phoneNumber,
                  name: loginResponse.name,
                  userId: loginResponse.userId,
                });
                this._router.navigate(['/main']);
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


