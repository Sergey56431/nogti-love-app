// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SettingsActions {

  export class GetSettings {
    static readonly type = '[Settings] GetSettings';
    constructor(public userId: string) {}
  }
  export class GetSettingsSuccess {
    static readonly type = '[Settings] GetSettingsSuccess';
    constructor(public payload: any) {}
  }
}
