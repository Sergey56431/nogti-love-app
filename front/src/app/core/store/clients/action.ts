import {ClientType} from "@shared/types";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClientsAction {

  export class LoadClients {
    static readonly type: string = "[Load] Load clients";
  }

  export class LoadClientsSuccess {
    static readonly type: string = "[Load Success] Load clients success";
    constructor(public readonly payload: ClientType[]) {
    }
  }
}
