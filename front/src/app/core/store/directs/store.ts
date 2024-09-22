import {CalendarResponse} from '@shared/types';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {CalendarService} from '@shared/services';
import {Directs} from '@core/store/directs/actions';

export interface DirectsStateModel {
  directs?: CalendarResponse;
}

@State<DirectsStateModel>({
  name: 'Directs',
  defaults: {
    directs: []
  }
})

@Injectable()
export class DirectsState {
  constructor(private readonly _service: CalendarService) {
  }

  @Selector()
  public static getDirects(state: DirectsStateModel) {
    return state.directs;
  }

  @Action(Directs.GetDirects)
  private _loadDirects(ctx: StateContext<DirectsStateModel>, action: Directs.GetDirects) {
    const state = ctx.getState();
    if (state.directs !== null) {
      return;
    }
    this._service.getDirects(action.id).subscribe(directs => {
      ctx.setState({
        directs: directs
      });
      ctx.dispatch(new Directs.GetDirectsSuccess(directs));
    });
  }
}



