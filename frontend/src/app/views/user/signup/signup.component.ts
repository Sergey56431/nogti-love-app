import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {SignupResponseType} from "../../../../types/signup-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: []
})
export class SignupComponent implements OnInit {

  signupForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8})$'), Validators.required]],
    username: ['', [Validators.pattern('^[А-Я][а-я]*'), Validators.required]],
    phone: ['', [Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$'), Validators.required]],
    birth_day: ['', [Validators.pattern('^(?:0[1-9]|[12]\\d|3[01])([\\/.-])(?:0[1-9]|1[012])\\1(?:19|20)\\d\\d$'), Validators.required]],
    accept: [false, [Validators.requiredTrue]]
  })

  private birthDay: string[] = [];

  constructor(private authService: AuthService,
              private router: Router,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  get username() {
    return this.signupForm.get('username');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get phone() {
    return this.signupForm.get('phone');
  }

  get birth_day() {
    return this.signupForm.get('birth_day');
  }

  signup() {
    if (this.signupForm.valid && this.signupForm.value.email && this.signupForm.value.password
      && this.signupForm.value.phone && this.signupForm.value.username && this.signupForm.value.birth_day) {

      this.birthDay = this.signupForm.value.birth_day.split('.');
      let sendBirthDay = this.birthDay[2] + '-' + this.birthDay[1] + '-' + this.birthDay[0]

      this.authService.signup(this.signupForm.value.email, this.signupForm.value.password,
        this.signupForm.value.phone, this.signupForm.value.username, sendBirthDay)
        .subscribe({
          next: (data: DefaultResponseType | SignupResponseType) => {

            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }
            const loginResponse = (data as LoginResponseType)
            if (!loginResponse.accessToken) {
              error = 'Ошибка регистрации'
            }
            if (this.signupForm.value.email && this.signupForm.value.password) {
              this.authService.login(this.signupForm.value.email, this.signupForm.value.password)
                .subscribe({
                  next: (data: LoginResponseType) => {
                    if (data.error || !data.accessToken ||
                      !data.username) {
                      this._snackBar.open('Ошибка при авторизации');
                      throw new Error(data.message ? data.message : 'Error with data on login')
                    }
                    this.router.navigate(['/main']);
                  },
                  error: (error: HttpErrorResponse) => {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error(error.error.message)
                  }
                })
            }
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.message)
            } else {
              this._snackBar.open('Ошибка регистрации')
            }
          }
        })
    }
  }
}
