import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetAuthData } from './auth.actions';
import {UserInfoType} from '@shared/types';

export interface AuthenticationStateModel {
  user: UserInfoType[]
}

@State<AuthenticationStateModel>({
  name: 'authState',
  defaults: {}
})
@Injectable()
export class AuthState {

  @Selector()
  static getAuthData(state: AuthenticationStateModel): AuthenticationStateModel {
    return state.user;
  }

  private static setInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  private static getInstanceState(state: AuthenticationStateModel): AuthenticationStateModel {
    return { ...state };
  }

  @Action(SetAuthData)
  setAuthData(
    { setState }: StateContext<AuthenticationStateModel>,
    { payload }: SetAuthData
  ) {
    setState(AuthState.setInstanceState(payload));
  }
}
