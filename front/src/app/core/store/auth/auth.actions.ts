
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthData {

  export class login {
    static readonly type = '[Auth] Login';
    constructor(readonly payload: {username: string, password: string}) {}
  }

  export class logout {
    static readonly type = '[Auth] Logout';
  }

}
