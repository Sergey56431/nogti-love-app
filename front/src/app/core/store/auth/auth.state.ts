import {Inject, Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {AuthData} from '@core/store/auth/auth.actions';
import {AuthService} from '@core/auth';
import {CookieService} from "ngx-cookie-service";

export interface AuthenticationStateModel {
  userInfo: []
  authToken: string | null
}

@State<AuthenticationStateModel>({
  name: 'authState',
  defaults: {

  }
})

@Injectable()
export class AuthState {

  @Selector()
  static getAuthData(state: AuthenticationStateModel): string | null {
    return state.authToken;
  }

  @Selector()
  static getISAuth(state: AuthenticationStateModel): boolean {
    return !!state.authToken;
  }

  private _authService = Inject(AuthService);
  private _cookiesService = Inject(CookieService);

  @Action(AuthData.login)
  _login(ctx: StateContext<AuthenticationStateModel>, action: AuthData.login) {
    const state =
  }
}
