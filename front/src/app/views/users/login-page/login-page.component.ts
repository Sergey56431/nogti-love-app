import { Component } from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf, NgStyle} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoginResponseType} from "../../../shared/types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../shared/types/default-response.type";

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

  isLogged: boolean = false;
  loginForm = this.fb.group({
    username: ['', [ Validators.required]],
    password: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    rememberMe: false
  })

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.valid && this.loginForm.value.username && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe({
          next: (data: LoginResponseType | DefaultResponseType) => {
            if (!(data as LoginResponseType).accessToken) {
              this._snackBar.open('Ошибка при авторизации');
              throw new Error(data.message ? data.message : 'Error with data on login')
            }
            this.authService.setUserInfo({
              name: this.loginForm.value.username,

            })
            if (data && (data as LoginResponseType).accessToken){
              this.authService.setTokens((data as LoginResponseType).accessToken);
              this.router.navigate(['/main']);
            }



          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при авторизации');
            throw new Error(error.error.message)
          }
        })
    }
  }
}


