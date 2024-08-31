import {Component} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf, NgStyle} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '@core/auth';
import {DefaultResponseType, LoginResponseType, SignupResponseType} from '@shared/types';


@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgStyle
  ],
  templateUrl: './registration-page.component.html'
})
export class RegistrationPageComponent {

  protected _signupForm = this._fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    username: ['', [Validators.required]],
    phone: ['', [Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$'), Validators.required]],
    // birth_day: ['', [Validators.pattern('^(?:0[1-9]|[12]\\d|3[01])([\\/.-])(?:0[1-9]|1[012])\\1(?:19|20)\\d\\d$')]],
    accept: [false, [Validators.requiredTrue]]
  });

  // private birthDay: string[] = [];

  constructor(private _authService: AuthService,
              private _router: Router,
              private _fb: FormBuilder,
              private _snackBar: MatSnackBar) {
  }

  get username() {
    return this._signupForm.get('username');
  }

  get email() {
    return this._signupForm.get('email');
  }

  get password() {
    return this._signupForm.get('password');
  }

  get phone() {
    return this._signupForm.get('phone');
  }

  // get birth_day() {
  //   return this.signupForm.get('birth_day');
  // }

  signup() {
    if (this._signupForm.valid && this._signupForm.value.email && this._signupForm.value.password
      && this._signupForm.value.phone && this._signupForm.value.username
      //&& this.signupForm.value.birth_day
    ) {

      // this.birthDay = this.signupForm.value.birth_day.split('.');
      // let sendBirthDay = this.birthDay[2] + '-' + this.birthDay[1] + '-' + this.birthDay[0]

      this._authService.signup(this._signupForm.value.email, this._signupForm.value.password,
        this._signupForm.value.phone, this._signupForm.value.username)
        .subscribe({
          next: (data: DefaultResponseType | SignupResponseType) => {

            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
              console.log(error);
            }

            this._authService.login(this._signupForm.value.username!, this._signupForm.value.password!)
              .subscribe({
                next: (data: LoginResponseType | DefaultResponseType) => {
                  if ((data as DefaultResponseType).error ||
                    !(data as LoginResponseType).accessToken || !(data as LoginResponseType).username) {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error(data.message ? data.message : 'Error with data on login');
                  }
                  this._router.navigate(['/main']);
                },
                error: (error: HttpErrorResponse) => {
                  this._snackBar.open('Ошибка при авторизации');
                  throw new Error(error.error.message);
                }
              });

          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        });
    }
  }
}
