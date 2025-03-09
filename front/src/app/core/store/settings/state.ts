import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SettingsType } from '@shared/types/settings.type';
import { SettingsActions } from './actions';
import { patch } from '@ngxs/store/operators';
import { SettingsService } from '@shared/services/settings/settings.service';

export interface SettingsStateModel {
  settings?: SettingsType;
}

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {},
})

@Injectable()
export class SettingsState {
  constructor(private readonly _settingsService: SettingsService) {
  }

  @Selector()
  static getSettings(state: SettingsStateModel) {
    return state.settings;
  }

  @Action(SettingsActions.GetSettings)
  private _getSettings(ctx: StateContext<SettingsStateModel>, action: SettingsActions.GetSettings) {
    const state = ctx.getState();
    if (state != null) {
      return;
    } else {
      this._settingsService.getSettings(action.userId).subscribe(settings => {
        ctx.setState(patch({
          settings,
        }));

        ctx.dispatch(new SettingsActions.GetSettingsSuccess(settings));
      });
    }
  }
}
