import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { CookieService } from 'ngx-cookie-service';
import { LoginResponseType } from '@shared/types';
import { AuthService } from '@core/auth';

export interface AuthenticationStateModel {
  loginInfo?: LoginResponseType;
}

@State<AuthenticationStateModel>({
  name: 'user',
  defaults: {},
})
@Injectable()
export class AuthState {
  constructor(
    private _authService: AuthService,
    private _cookiesService: CookieService,
  ) {}

  @Selector()
  static getUserInfo(state: AuthenticationStateModel) {
    return state.loginInfo;
  }

  // @Action(AuthData.LoginUser)
  // private _getUser(ctx: StateContext<AuthenticationStateModel>, action: AuthData.LoginUser): Observable<UserInfoType> {
  //   const state = ctx.getState();
  //   if (state.loginInfo != null) {
  //     return state as Observable<UserInfoType>;
  //   }
  //   return this._authService.login(action.username, action.password)
  //     .pipe(
  //       tap((user: ) => {
  //         ctx.setState(patch({
  //           userInfo: user
  //         }));
  //         this._authService.setUserInfo(user);
  //         ctx.dispatch(new AuthData.GetUserSuccess(user));
  //       })
  //     );
  // }
}
