import {UserInfoType} from "@shared/types";

export namespace UsersActions {
  export class GetUser {
    static readonly type = '[Users] Get User';
    constructor(public readonly id: string) {}
  }

  export class GetUserSuccess {
    static readonly type = '[Users] Get User Success';
    constructor(public readonly payload: UserInfoType) {}
  }
}
