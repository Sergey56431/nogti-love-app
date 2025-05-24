import { OperationCategoryInterface } from '@shared/types/operations';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { CategoryOperationsService } from '@shared/services';
import { OperationsCategory } from '@core/store';

interface OperationCategoriesStateModel {
  categoriesList: OperationCategoryInterface[];
  category: OperationCategoryInterface;
}

@State<OperationCategoriesStateModel>({
  name: 'OperationsCategory',
  defaults: {
    categoriesList: [],
    category: {} as OperationCategoryInterface,
  },
})

@Injectable()
export class OperationCategoriesState {
  private readonly _operationCategoriesService = inject(CategoryOperationsService);

  @Selector()
  static getCategories(state: OperationCategoriesStateModel) {
    return state.categoriesList;
  }

  @Selector()
  static getCategory(state: OperationCategoriesStateModel) {
    return state.category;
  }

  @Action(OperationsCategory.UserOperationCategories)
  private _userOperationCategories(ctx: StateContext<OperationCategoriesStateModel>, action: OperationsCategory.UserOperationCategories) {
    const state = ctx.getState();
    if (state.categoriesList && state.categoriesList.length !== 0) {
      return state.categoriesList;
    }
    this._operationCategoriesService.getCategoriesByUser(action.userId)
      .subscribe(categoriesList => {
        if (categoriesList) {
          ctx.patchState({
            categoriesList,
          });
        }
      });
    return state.categoriesList;
  }

  @Action(OperationsCategory.GetOperationCategory)
  private _getOperationCategory(ctx: StateContext<OperationCategoriesStateModel>, action: OperationsCategory.GetOperationCategory) {
    const state = ctx.getState();
    if (state.categoriesList && state.categoriesList.length !== 0) {
      const category = state.categoriesList.find((category) => category.id === action.categoryId);
      ctx.patchState({
        category: category
      });
      return state.category;
    }
    this._operationCategoriesService.getCategoryById(action.categoryId).subscribe(category => {
      if (category) {
        ctx.patchState({
          category: category,
        });
      }
    });

    return state.category;
  }

  @Action(OperationsCategory.AddOperationCategory)
  private _addOperationCategory(ctx: StateContext<OperationCategoriesStateModel>, action: OperationsCategory.AddOperationCategory) {
    const state = ctx.getState();
    this._operationCategoriesService.createCategory(action.category).subscribe(category => {
      if (category) {
        ctx.patchState({
          categoriesList: [...state.categoriesList, category],
        });
      }
    });
    return state.categoriesList;
  }

  @Action(OperationsCategory.DeleteOperationCategory)
  private _deleteOperationCategory(ctx: StateContext<OperationCategoriesStateModel>, action: OperationsCategory.DeleteOperationCategory) {
    const state = ctx.getState();
    this._operationCategoriesService.deleteCategory(action.categoryId).subscribe(() => {
      ctx.patchState({
        categoriesList: [...state.categoriesList.filter((category) => category.id !== action.categoryId)],
      });
    });
    return state.categoriesList;
  }

  @Action(OperationsCategory.UpdateOperationCategory)
  private _updateOperationCategory(ctx: StateContext<OperationCategoriesStateModel>, action: OperationsCategory.UpdateOperationCategory) {
    const state = ctx.getState();
    this._operationCategoriesService.editCategory(action.category).subscribe(category => {
      if (category) {
        ctx.patchState({
          categoriesList: [...state.categoriesList.map((category) => {
            if (category.id === action.category.id) {
              return action.category;
            }
            return category;
          })],
        });
      }
    });
    return state.categoriesList;
  }
}

