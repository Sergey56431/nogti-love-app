import {Inject, Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {AuthData} from '@core/store/auth/auth.actions';
import {AuthService} from '@core/auth';
import {tap} from 'rxjs';

export interface AuthenticationStateModel {
  username: string | null
  authToken: string | null
}

@State<AuthenticationStateModel>({
  name: 'authState',
  defaults: {
    username: null,
    authToken: null
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

  @Action(AuthData.login)
  login(ctx: StateContext<AuthenticationStateModel>, action: AuthData.login) {
    return this._authService.login(action.payload).pipe(
      tap((result: {token: string}) =>{
        ctx.patchState({
          authToken: result.token,
          username: action.payload.username
        });
      })
    );
  }
}
