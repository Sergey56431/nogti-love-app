import { OperationCategoryInterface } from '@shared/types/operations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OperationsCategory {
  export class UserOperationCategories {
    static readonly type = '[OperationCategories] Get Operation Categories';
    constructor(public readonly userId: string) {
    }
  }

  export class GetOperationCategory {
    static readonly type = '[OperationCategories] Get Operation Category';
    constructor(public readonly categoryId: string) {}
  }

  export class AddOperationCategory {
    static readonly type = '[OperationCategories] Add Operation Categories';
    constructor(public readonly category: OperationCategoryInterface) {}
  }

  export class UpdateOperationCategory {
    static readonly type = '[OperationCategories] Update Operation Categories';
    constructor(public readonly category: OperationCategoryInterface) {}
  }

  export class DeleteOperationCategory {
    public static readonly type = '[OperationCategories] Delete Operation Categories';
    constructor(public readonly categoryId: string) {}
  }
}
