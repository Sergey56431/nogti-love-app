export namespace Transactions {
  export class GetOperations {
    static readonly type: string = '[Operations] Get Operations';
    constructor(public readonly query: string[], public readonly userId: string) {
    }
  }
}
