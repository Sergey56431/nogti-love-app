import { CreateOperationInterface, OperationsInterface } from '@shared/types/operations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Transactions {
  export class GetOperations {
    static readonly type: string = '[Operations] Get Operations';
    constructor(public readonly userId: string, public readonly query?: { period?: string, type?: string} ) {
    }
  }

  export class GetOperation {
    static readonly type: string = '[Operations] Get Operation';
    constructor(public readonly id: string) {}
  }

  export class CreateOperation {
    public static readonly type: string = '[Operations] Create Operation';
    constructor(public readonly payload: CreateOperationInterface) {}
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
