export interface OperationsInterface {
  id: string;
  categoryOperations: {
    type: string;
    name: string;
  }
  value: number;
  createDate: string;
  updateDate: string;
  userId: string;
  categoryId: string;
}

export interface OperationCategoryInterface {
  type: string;
  name: string;
  userId: string;
  id: string;
}

export interface CreateOperationInterface {
  userId: string,
  categoryId: string,
  value: number
}
