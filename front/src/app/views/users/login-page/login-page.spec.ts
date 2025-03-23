// import { LoginPageComponent } from '@views/users';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { HttpClient, HttpHandler } from '@angular/common/http';
// import { AuthService } from '@core/auth';
// import { MessageService } from 'primeng/api';
// import { ActivatedRoute, Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { SnackStatusesUtil } from '@shared/utils';
//
// describe('Страница авторизации', () => {
//   let authService: AuthService;
//   let router: Router;
//   let snackBar: MessageService;
//   let page: any;
//   let fixture: ComponentFixture<LoginPageComponent>;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         ReactiveFormsModule,
//         // Убедитесь, что HttpClientModule импортирован
//         LoginPageComponent,
//       ],
//       providers: [
//         HttpClient,
//         HttpHandler,
//         AuthService,
//         MessageService, {
//           provide: ActivatedRoute,
//           useValue: {
//             params: of({}), // Мокаем параметры маршрута
//             snapshot: {
//               params: {},
//             },
//             queryParams: of({}), // Мокаем queryParams
//             data: of({}), // Мокаем data
//           },
//         }],
//     }).compileComponents();
//     fixture = TestBed.createComponent(LoginPageComponent);
//     page = fixture.componentInstance;
//     authService = TestBed.inject(AuthService);
//     router = TestBed.inject(Router);
//     snackBar = TestBed.inject(MessageService);
//   });
//
//   it('Нельзя нажать кнопку входа, если поля не заполнены', () => {
//     expect(page.phoneNumber?.setValue(''));
//   });
//
//   it('should login successfully', () => {
//     const loginResponse = {
//       access_token: 'testToken',
//       phoneNumber: 'testPhoneNumber',
//       name: 'testName',
//       userId: 'testUserId',
//     };
//     (authService.login as jasmine.Spy).and.returnValue(of(loginResponse));
//     page._loginForm.setValue({
//       phoneNumber: 'testPhoneNumber',
//       password: 'testPassword',
//     });
//     page._login();
//     expect(authService.login).toHaveBeenCalledWith('testPhoneNumber', 'testPassword');
//     expect(authService.setTokens).toHaveBeenCalledWith('testToken');
//     expect(authService.setUserInfo).toHaveBeenCalledWith({
//       phoneNumber: 'testPhoneNumber',
//       name: 'testName',
//       userId: 'testUserId',
//     });
//     expect(router.navigate).toHaveBeenCalledWith(['/main']);
//   });
//
//   it('should handle login error', () => {
//     const errorResponse = {
//       error: {
//         message: 'testErrorMessage',
//       },
//     };
//     (authService.login as jasmine.Spy).and.returnValue(throwError(errorResponse));
//     page._loginForm.setValue({
//       phoneNumber: 'testPhoneNumber',
//       password: 'testPassword',
//     });
//     page._login();
//     expect(authService.login).toHaveBeenCalledWith('testPhoneNumber', 'testPassword');
//     expect(snackBar.add).toHaveBeenCalledWith(SnackStatusesUtil.getStatuses('error', 'Ошибка при авторизации'));
//     expect(() => {
//       page._login();
//     }).toThrowError('testErrorMessage');
//   });
//
//   it('should handle login form invalid', () => {
//     page._loginForm.setValue({
//       phoneNumber: '',
//       password: '',
//     });
//     page._login();
//     expect(authService.login).not.toHaveBeenCalled();
//   });
//
//   it('should handle login form missing phoneNumber', () => {
//     page._loginForm.setValue({
//       phoneNumber: '',
//       password: 'testPassword',
//     });
//     page._login();
//     expect(authService.login).not.toHaveBeenCalled();
//   });
//
//   it('should handle login form missing password', () => {
//     page._loginForm.setValue({
//       phoneNumber: 'testPhoneNumber',
//       password: '',
//     });
//     page._login();
//     expect(authService.login).not.toHaveBeenCalled();
//   });
// });
