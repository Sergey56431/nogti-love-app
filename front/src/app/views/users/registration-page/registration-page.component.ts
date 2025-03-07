import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth';
import { DefaultResponseType, LoginResponseType } from '@shared/types';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './registration-page.component.html',
})
export class RegistrationPageComponent {
  private _status: ToastMessageOptions = {} as ToastMessageOptions;

  protected _signupForm = this._fb.group({
    password: ['', [Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$'), Validators.required]],
    username: ['', [Validators.required]],
    phone: ['', [Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$')]],
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    accept: [false, [Validators.requiredTrue]],
  });

  constructor(private _authService: AuthService,
              private _router: Router,
              private _fb: FormBuilder,
              private _snackBar: MessageService) {
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
        phoneNumber: this._signupForm.value.phone?.toString() ?? '',
        lastName: this._signupForm.value.lastName!,
      })
        .subscribe({
          error: err => {
            this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при регистрации');
            this._snackBar.add(this._status);
            console.log(err);
          },
          complete: () => {
            this._authService.login(this._signupForm.value.phone!, this._signupForm.value.password!)
              .subscribe({
                next: (data: LoginResponseType | DefaultResponseType) => {
                  if (data as LoginResponseType) {
                    const loginResponse = data as LoginResponseType;
                    if (!loginResponse.access_token) {
                      this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при авторизации');
                      this._snackBar.add(this._status);
                      throw new Error('Ошибка при авторизации');
                    } else {
                      this._authService.setTokens(loginResponse.access_token);
                      this._authService.setUserInfo({
                        userId: loginResponse.userId,
                        phoneNumber: loginResponse.phoneNumber,
                        name: loginResponse.name,
                      });
                      this._router.navigate(['/main']);
                    }
                  }
                },
                error: (error: HttpErrorResponse) => {
                  this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при авторизации');
                  this._snackBar.add(this._status);
                  throw new Error(error.error.message);
                },
              });
          },
        });
    }
  }
}
