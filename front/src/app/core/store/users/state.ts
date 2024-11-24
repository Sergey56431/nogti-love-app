import {UserInfoType} from '@shared/types';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {UsersActions} from '@core/store/users/action';
import {patch} from '@ngxs/store/operators';
import {UsersService} from '@shared/services';

export interface UserStateModel {
  user?: UserInfoType
  usersList?: UserInfoType[]
}

@State<UserStateModel>({
  name: 'users',
  defaults: {
    user: undefined,
    usersList: []
  }
})

@Injectable()
export class UserState {
  constructor(private readonly _service: UsersService) {
  };

  @Selector()
  public static getUser(state: UserStateModel) {
    return state.user;
  }

  @Selector()
  public static getUsers(state: UserStateModel) {
    return state.usersList;
  }

  @Action(UsersActions.GetUser)
  private _loadUser(ctx: StateContext<UserStateModel>, action: UsersActions.GetUser) {
    const state = ctx.getState();
    if (state.user != null) {
      return;
    }
    this._service.userInfo(action.id).subscribe((user: UserInfoType) => {
      ctx.setState(patch({
        user: user
      }));

      ctx.dispatch(new UsersActions.GetUserSuccess(user));
    });
  }
}
