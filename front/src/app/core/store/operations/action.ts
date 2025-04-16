import { OperationsInterface } from '@shared/types/operations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Transactions {
  export class GetOperations {
    static readonly type: string = '[Operations] Get Operations';
    constructor(public readonly query: string[], public readonly userId: string) {
    }
  }

  export class CreateOperation {
    public static readonly type: string = '[Operations] Create Operation';
    constructor(public readonly payload: OperationsInterface, public readonly userId: string) {}
  }

  export class UpdateOperation {
    public static readonly type: string = '[Operations] Update Operation';
    constructor(public readonly payload: Partial<OperationsInterface>, public readonly operationId: string) {}
  }

  export class DeleteOperation {
    public static readonly type: string = '[Operations] Delete Operation';
    constructor(public readonly id: string) {}
  }
}
