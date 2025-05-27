import { OperationType } from '@shared/utils';

export interface QueryParams {
  dateFrom?: string,
  dateTo?: string,
  type?: OperationType
}
