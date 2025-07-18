import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/auth';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { LoginResponseType } from '@shared/types';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let snackBarSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'setTokens', 'setUserInfo']);
    snackBarSpy = jasmine.createSpyObj('MessageService', ['add']);

   await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule, // ← обязательно!
        LoginPageComponent
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('должен создаваться', () => {
    expect(!!component).toBe(true);
  });

  it('форма должна быть невалидной по умолчанию', () => {
    expect(component['_loginForm'].valid).toBe(false);
  });

  it('форма становится валидной при заполнении', () => {
    component['_loginForm'].setValue({
      phoneNumber: '1234567890',
      password: 'password',
      rememberMe: false,
    });
    expect(component['_loginForm'].valid).toBe(true);
  });

  it('успешный логин вызывает setTokens, setUserInfo и навигацию', fakeAsync(() => {
    const loginResponse: LoginResponseType = {
      access_token: 'token',
      phoneNumber: '1234567890',
      name: 'Test User',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'ADMIN',
    };
    authServiceSpy.login.and.returnValue(of(loginResponse));

    component['_loginForm'].setValue({
      phoneNumber: '1234567890',
      password: 'password',
      rememberMe: false,
    });

    component['_login']();
    tick();

    expect(authServiceSpy.setTokens.calls.any()).toBe(true);
    expect(authServiceSpy.setTokens.calls.mostRecent().args[0]).toBe('token');
    expect(authServiceSpy.setUserInfo.calls.any()).toBe(true);
    expect(authServiceSpy.setUserInfo.calls.mostRecent().args[0]).toEqual({
      phoneNumber: '1234567890',
      name: 'Test User',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect((router.navigate as jasmine.Spy).calls.any()).toBe(true);
    expect((router.navigate as jasmine.Spy).calls.mostRecent().args[0]).toEqual(['/main']);
  }));

  it('ошибка логина вызывает snackbar и выбрасывает ошибку', fakeAsync(() => {
    const errorResponse = { error: { message: 'Ошибка' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component['_loginForm'].setValue({
      phoneNumber: '1234567890',
      password: 'password',
      rememberMe: false,
    });

    let thrownError = null;
    try {
      component['_login']();
      tick();
    } catch (e) {
      thrownError = e;
    }
    expect(thrownError).not.toBeNull();
    expect((thrownError as Error).message).toBe('Ошибка');
    expect(snackBarSpy.add.calls.any()).toBe(true);
  }));

  it('ошибка в ответе сервера вызывает snackbar и выбрасывает ошибку', fakeAsync(() => {
    const errorData = { error: true, message: 'Ошибка при авторизации' };
    authServiceSpy.login.and.returnValue(of(errorData));

    component['_loginForm'].setValue({
      phoneNumber: '1234567890',
      password: 'password',
      rememberMe: false,
    });

    let thrownError = null;
    try {
      component['_login']();
      tick();
    } catch (e) {
      thrownError = e;
    }
    expect(thrownError).not.toBeNull();
    expect((thrownError as Error).message).toBe('Ошибка при авторизации');
    expect(snackBarSpy.add.calls.any()).toBe(true);
  }));

  it('геттеры phoneNumber и password возвращают контролы формы', () => {
    expect(component.phoneNumber).toBe(component['_loginForm'].get('phoneNumber'));
    expect(component.password).toBe(component['_loginForm'].get('password'));
  });
});
