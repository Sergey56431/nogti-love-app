import { OperationsInterface } from '@shared/types/operations';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { OperationsService } from '@shared/services';
import { Transactions } from './action';

interface OperationsStateModel {
  operationsList: OperationsInterface[];
}

@State<OperationsStateModel>({
  name: 'operations',
  defaults: {
    operationsList: [],
  }
})

@Injectable()
export class OperationsState {
  private readonly _operationsService = inject(OperationsService);

  @Selector()
  static getOperations(state: OperationsStateModel) {
    return state.operationsList;
  }

  @Action(Transactions.GetOperations)
  private _getAllUserOperations(ctx: StateContext<OperationsStateModel>, action: Transactions.GetOperations) {
    const state = ctx.getState();
    if (state.operationsList != null) {
      return state.operationsList;
    }
    this._operationsService.fetchOperationsByUser(action.userId).subscribe((operations) => {
      if ('value' in operations) {
        ctx.patchState({
          operationsList: operations as OperationsInterface[],
        });
      }
    });
    return state.operationsList;
  }
}
