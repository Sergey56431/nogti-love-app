import { SettingsType } from '@shared/types/settings.type';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SettingsActions {

  export class GetSettings {
    static readonly type = '[Settings] Get Settings';
    constructor(public userId: string) {}
  }
  export class GetSettingsSuccess {
    static readonly type = '[Settings] Get Settings Success';
    constructor(public payload: SettingsType) {}
  }
}
