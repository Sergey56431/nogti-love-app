import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {LoginResponseType} from "../../../../types/login-response.type";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit {

  isLogged: boolean = false;
  loginForm = this.fb.group({
    username: ['', [Validators.pattern('^[А-Я][а-я]*'), Validators.required]],
    password: ['', [Validators.pattern('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8})$'), Validators.required]],
    rememberMe: false
  })

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
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
          next: (data: LoginResponseType) => {
            console.log(data)
            if (!data.accessToken) {
              this._snackBar.open('Ошибка при авторизации');
              throw new Error(data.message ? data.message : 'Error with data on login')
            }

            this.authService.setUserInfo({
              name: this.loginForm.value.username,

            })
            this.authService.setTokens(data.accessToken);
            this.router.navigate(['/main']);

          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при авторизации');
            throw new Error(error.error.message)
          }
        })
    }
  }
}
