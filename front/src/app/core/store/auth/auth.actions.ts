import {UserInfoType} from '@shared/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthData {

  export class LoginUser {
    static readonly type = '[User] Get User';
    constructor(public readonly phoneNumber: string, public readonly password: string) {}
  }

  export class LogoutUser {
    static readonly type = '[User] Logout';
  }

  export class RegistrationUser {
    static readonly type = '[User] Get User Success';
    constructor(readonly payload: UserInfoType) {};
  }
}
