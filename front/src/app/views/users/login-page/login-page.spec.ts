import {LoginPageComponent} from '@views/users';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';

describe('Login Page', () => {
  let page: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginPageComponent],
    });
    fixture = TestBed.createComponent(LoginPageComponent);
    page = fixture.componentInstance;
  });

  // it('should be not access', () => {
  //   expect(!page._loginForm.controls.username).;
  // });
});
