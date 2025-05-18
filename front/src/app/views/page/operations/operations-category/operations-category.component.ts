import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { NgStyle } from '@angular/common';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationCategoriesState, OperationsCategory } from '@core/store';
import { AuthService } from '@core/auth';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CategoryOperationFormComponent } from '@shared/components';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { OperationCategoryInterface } from '@shared/types/operations';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-operations-category',
  standalone: true,
  imports: [
    Button,
    NgStyle,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './operations-category.component.html',
  styleUrl: './operations-category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsCategoryComponent implements OnInit {
  private _ref: DynamicDialogRef | undefined;

  protected _categoriesList = computed(() => {
    return this._operationCategories();
  });
  private _operationCategories = select(OperationCategoriesState.getCategories);

  private readonly _modalOption = {
    width: '400px',
    closable: true,
    contentStyle: {
      paddingTop: '8px'
    },
    closeOnEscape: true,
    modal: true,
  };

  private readonly _actions = createDispatchMap({
    getCategories: OperationsCategory.UserOperationCategories,
    deleteCategory: OperationsCategory.DeleteOperationCategory
  });

  private readonly _authService = inject(AuthService);
  private readonly _dialogService = inject(DialogService);
  private readonly _confirmationService = inject(ConfirmationService);

  public ngOnInit(): void {
    this._actions.getCategories(this._authService.getUserInfo().userId ?? '');
  }

  protected _addCategory(): void {
    this._ref = this._dialogService.open(CategoryOperationFormComponent, {
      ...this._modalOption,
      header: 'Добавить категорию',
      data: {
        isEdit: false,
      }
    });
  }

  protected _editCategory(categoryId: string): void {
    this._ref = this._dialogService.open(CategoryOperationFormComponent, {
      ...this._modalOption,
      header: 'Редактировать категорию',
      data: {
        isEdit: true,
        id: categoryId
      }
    });
  }

  protected _deleteCategory(category: OperationCategoryInterface): void {
    this._confirmationService.confirm({
      message: `Вы уверены, что хотите удалить категорию '${category.name}'
      (Все операции, связанные с ней, будут удалены.)?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Отмена',
        severity: 'secondary',
        outlined: true,
        icon: 'pi pi-times',
      },
      acceptButtonProps: {
        severity: 'danger',
        outlined: false,
        icon: 'pi pi-trash',
        label: 'Удалить',
      },
      accept: () => {
        this._actions.deleteCategory(category.id);
      },
    });
  }

}

