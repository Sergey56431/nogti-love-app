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
    password: ['', [Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    username: ['', [Validators.required]],
    phone: ['', [Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$')]],
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    accept: [false, [Validators.requiredTrue]]
  });

  constructor(private _authService: AuthService,
              private _router: Router,
              private _fb: FormBuilder,
              private _snackBar: MatSnackBar) {
  }

  get username() {
    return this._signupForm.get('username');
  }

  get password() {
    return this._signupForm.get('password');
  }

  get phone() {
    return this._signupForm.get('phone');
  }

  get name() {
    return this._signupForm.get('name');
  }

  get lastName() {
    return this._signupForm.get('lastName');
  }

  protected _signup() {
    if (this._signupForm.valid && this._signupForm.value) {
      this._authService.signup({
          username: this._signupForm.value.username!,
          password: this._signupForm.value.password!.toString(),
          name: this._signupForm.value.name!,
          phoneNumber:  this._signupForm.value.phone?.toString() ?? '',
          lastName: this._signupForm.value.lastName!,
        },
      )
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
                  if ((data as DefaultResponseType).error !== undefined) {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error((data as DefaultResponseType).message );
                  }
                  if (data as LoginResponseType) {
                    const loginResponse = data as LoginResponseType;
                    if (!loginResponse.access_token) {
                      this._snackBar.open('Что-то пошло не так');
                    } else {
                      this._authService.setTokens(loginResponse.access_token,);
                      this._authService.setUserInfo({
                        userId: loginResponse.userId,
                        name: loginResponse.name,
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
