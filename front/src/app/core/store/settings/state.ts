import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { SettingsType } from '@shared/types/settings.type';

export interface SettingsStateModel {
  settings: SettingsType[] | undefined
}

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    settings: []
  },
})

@Injectable()
export class SettingsState {

  @Selector()
  static getSettings(state: SettingsStateModel) {
    return state.settings;
  }
}
