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
  },
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

  @Action(Transactions.CreateOperation)
  private _createOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.CreateOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.createOperation(action.payload, action.userId).subscribe((response) => {
      if ('value' in response) {
        ctx.setState({
          operationsList: [...state, response],
        });
      }
      return state;
    });
  }

  @Action(Transactions.UpdateOperation)
  private _updateOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.UpdateOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.updateOperation(action.payload, action.operationId).subscribe((response) => {
      if ('value' in response) {
        ctx.setState({
          operationsList: [...state, response],
        });
      }
      return state;
    });
  }

  @Action(Transactions.DeleteOperation)
  private _deleteOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.DeleteOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.deleteOperation(action.id).subscribe((response) => {
      if ('value' in response) {
        ctx.setState({
          operationsList: state.filter(operation => operation.id !== response.id),
        });
      }
      return state;
    });
  }
}
