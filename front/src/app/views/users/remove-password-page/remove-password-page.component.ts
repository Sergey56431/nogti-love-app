import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth';
import { DefaultResponseType } from '@shared/types';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-remove-password-page',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        StepsModule,
        InputTextModule,
        ButtonModule,
        CardModule
    ],
    templateUrl: './remove-password-page.component.html',
    styleUrl: './remove-password-page.component.scss'
})
export class RemovePasswordPageComponent {
  private _status: ToastMessageOptions = {} as ToastMessageOptions;
  protected _activeStep = 0;
  protected _isLoading = false;
  protected _codeSent = false;

  protected _resetForm = this._fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$')]],
    verificationCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,12})$')]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this._passwordMatchValidator });

  protected _steps = [
    { label: 'Ввод номера телефона' },
    { label: 'Подтверждение кода' },
    { label: 'Новый пароль' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _snackBar: MessageService
  ) {}

  get phoneNumber() {
    return this._resetForm.get('phoneNumber');
  }

  get verificationCode() {
    return this._resetForm.get('verificationCode');
  }

  get newPassword() {
    return this._resetForm.get('newPassword');
  }

  get confirmPassword() {
    return this._resetForm.get('confirmPassword');
  }

  private _passwordMatchValidator(group: any) {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  protected _sendResetCode() {
    if (this.phoneNumber?.valid && this.phoneNumber?.value) {
      this._isLoading = true;
      this._authService.sendResetCode(this.phoneNumber.value)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._status = SnackStatusesUtil.getStatuses('error', data.message || 'Ошибка при отправке кода');
              this._snackBar.add(this._status);
            } else {
              this._status = SnackStatusesUtil.getStatuses('success', 'Код подтверждения отправлен на ваш номер');
              this._snackBar.add(this._status);
              this._codeSent = true;
              this._activeStep = 1;
            }
          },
          error: (error: HttpErrorResponse) => {
            this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при отправке кода');
            this._snackBar.add(this._status);
          },
          complete: () => {
            this._isLoading = false;
          }
        });
    }
  }

  protected _verifyCode() {
    if (this.verificationCode?.valid && this.verificationCode?.value && this.phoneNumber?.value) {
      this._isLoading = true;
      this._authService.verifyResetCode(this.phoneNumber.value, this.verificationCode.value)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._status = SnackStatusesUtil.getStatuses('error', data.message || 'Неверный код подтверждения');
              this._snackBar.add(this._status);
            } else {
              this._status = SnackStatusesUtil.getStatuses('success', 'Код подтвержден');
              this._snackBar.add(this._status);
              this._activeStep = 2;
            }
          },
          error: (error: HttpErrorResponse) => {
            this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при проверке кода');
            this._snackBar.add(this._status);
          },
          complete: () => {
            this._isLoading = false;
          }
        });
    }
  }

  protected _resetPassword() {
    if (this._resetForm.valid && 
        this.phoneNumber?.value && 
        this.verificationCode?.value && 
        this.newPassword?.value) {
      this._isLoading = true;
      this._authService.resetPassword(
        this.phoneNumber.value, 
        this.verificationCode.value, 
        this.newPassword.value
      )
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._status = SnackStatusesUtil.getStatuses('error', data.message || 'Ошибка при сбросе пароля');
              this._snackBar.add(this._status);
            } else {
              this._status = SnackStatusesUtil.getStatuses('success', 'Пароль успешно изменен');
              this._snackBar.add(this._status);
              this._router.navigate(['/login']);
            }
          },
          error: (error: HttpErrorResponse) => {
            this._status = SnackStatusesUtil.getStatuses('error', 'Ошибка при сбросе пароля');
            this._snackBar.add(this._status);
          },
          complete: () => {
            this._isLoading = false;
          }
        });
    }
  }

  protected _goToStep(step: number) {
    if (step === 0 || (step === 1 && this._codeSent) || (step === 2 && this._codeSent)) {
      this._activeStep = step;
    }
  }
}
