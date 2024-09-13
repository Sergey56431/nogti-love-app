import {ClientType} from '@shared/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClientsAction {

  export class LoadClients {
    static readonly type: string = '[Load] Load clients';
  }

  export class LoadClient {
    static readonly type: string = '[Load] Load client';
    constructor(public readonly id: string) {}
  }

  export class CreateClient {
    static readonly type: string = '[Create] Create client';
    constructor(public readonly client: ClientType) {}
  }

  export class UpdateClient {
    static readonly type: string = '[Update] Update client';
    constructor(public readonly client: ClientType) {}
  }

  export class DeleteClient {
    static readonly type: string = '[Delete] Delete client';
    constructor(public readonly id: string) {}
  }

  export class LoadClientsSuccess {
    static readonly type: string = '[Load Success] Load clients success';
    constructor(public readonly payload: ClientType[]) {
    }
  }
}
