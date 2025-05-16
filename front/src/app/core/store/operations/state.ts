import { OperationsInterface } from '@shared/types/operations';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { OperationsService } from '@shared/services';
import { Transactions } from './action';
import { DefaultResponseType } from '@shared/types';

interface OperationsStateModel {
  operationsList: OperationsInterface[];
  operation?: OperationsInterface
}

@State<OperationsStateModel>({
  name: 'operations',
  defaults: {
    operationsList: [],
    operation: undefined,
  },
})

@Injectable()
export class OperationsState {
  private readonly _operationsService = inject(OperationsService);

  @Selector()
  static getOperations(state: OperationsStateModel) {
    return state.operationsList;
  }

  @Selector()
  static getOperation(state: OperationsStateModel) {
    return state.operation;
  }

  @Action(Transactions.GetOperations)
  private _getAllUserOperations(ctx: StateContext<OperationsStateModel>, action: Transactions.GetOperations) {
    const state = ctx.getState();
    if (state.operationsList != null && state.operationsList.length > 0) {
      return state.operationsList;
    }
    this._operationsService.fetchOperationsByUser(action.userId, action.query)
      .subscribe((operations) => {
        if ((operations as DefaultResponseType).error == null) {
          ctx.setState({
            operationsList: operations as OperationsInterface[],
          });
        }
      });
    return state.operationsList;
  }

  @Action(Transactions.GetOperation)
  private _getOperationById(ctx: StateContext<OperationsStateModel>, action: Transactions.GetOperation) {
    const state = ctx.getState();
    if (state.operationsList != null && state.operationsList.length > 0) {
     const operation = state.operationsList.find(operation => operation.id === action.id);
     ctx.patchState({
       operation: operation,
     });
    }
    this._operationsService.fetchOneOperation(action.id).subscribe((operation) => {
      if ((operation as DefaultResponseType).error == null) {
        ctx.patchState({
          operation: operation as OperationsInterface
        });
      }
    });
    return state.operation;
  }



  @Action(Transactions.CreateOperation)
  private _createOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.CreateOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.createOperation(action.payload).subscribe((response) => {
      if ((response as DefaultResponseType).message == null) {
        ctx.setState({
          operationsList: [...state, response as OperationsInterface],
        });
      }
      return state;
    });
  }

  @Action(Transactions.UpdateOperation)
  private _updateOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.UpdateOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.updateOperation(action.payload, action.operationId).subscribe((response) => {
      if ((response as DefaultResponseType).error == null) {
        const updatedOperationsList = state.map(operation =>
          operation.id === action.operationId ? response as OperationsInterface : operation
        );
        ctx.patchState({
          operationsList: updatedOperationsList,
        });
      }
      return state;
    });
  }

  @Action(Transactions.DeleteOperation)
  private _deleteOperation(ctx: StateContext<OperationsStateModel>, action: Transactions.DeleteOperation) {
    const state = ctx.getState().operationsList;
    this._operationsService.deleteOperation(action.id).subscribe((response) => {
      if (!response || (response as DefaultResponseType).message != null) {
        ctx.setState({
          operationsList: state.filter(operation => operation.id !== action.id),
        });
      }
    });
  }
}
