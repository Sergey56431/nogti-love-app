import {Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {AuthData} from '@core/store/auth/auth.actions';
import {CookieService} from 'ngx-cookie-service';
import {UserInfoType} from '@shared/types';
import {patch} from '@ngxs/store/operators';
import {AuthService} from '@core/auth';
import {Observable, tap} from "rxjs";

export interface AuthenticationStateModel {
  userInfo?: UserInfoType;
}

@State<AuthenticationStateModel>({
  name: 'user',
  defaults: {}
})

@Injectable()
export class AuthState {
  constructor(private _authService: AuthService, private _cookiesService: CookieService) {
  }

  @Selector()
  static getUserInfo(state: AuthenticationStateModel) {
    return state.userInfo;
  }

  @Action(AuthData.GetUser)
  private _getUser(ctx: StateContext<AuthenticationStateModel>, action: AuthData.GetUser): Observable<UserInfoType> {
    const state = ctx.getState();
    if (state.userInfo != null) {
      // @ts-ignore
      return;
    }
    return this._authService.getUser(action.userId)
      .pipe(
        tap((user: UserInfoType) => {
          ctx.setState(patch({
            userInfo: user
          }));
          this._authService.setUserInfo(user);
          ctx.dispatch(new AuthData.GetUserSuccess(user));
        })
      );
  }
}
