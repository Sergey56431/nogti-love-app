import {UserInfoType} from '@shared/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthData {

  export class GetUser {
    static readonly type = '[User] Get User';
    constructor(public readonly userId: string) {}
  }

  export class logout {
    static readonly type = '[User] Logout';
  }

  export class GetUserSuccess {
    static readonly type = '[User] Get User Success';
    constructor(readonly payload: UserInfoType) {};
  }
}
