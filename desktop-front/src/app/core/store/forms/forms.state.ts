import { Injectable } from '@angular/core';
import { State, Action, Selector, StateContext } from '@ngxs/store';
import { Forms } from './forms.actions';
import FormsAction = Forms.FormsAction;
import {UserInfoType} from "../../../shared/types/user-info.type";

export interface FormsStateModel {
  user?: UserInfoType[];
}

@State<FormsStateModel>({
  name: 'forms',
  defaults: {}
})
@Injectable()
export class FormsState {

  @Selector()
  static getState(state: FormsStateModel) {
    return state;
  }

  @Action(FormsAction)
  add(ctx: StateContext<FormsStateModel>, { payload }: FormsAction) {
    const stateModel = ctx.getState();
    stateModel.user = [...stateModel.user, payload];
    ctx.setState(stateModel);
  }
}
