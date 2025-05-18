import { ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AuthService } from '@core/auth';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationsState, Transactions } from '@core/store';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CurrencyPipe, DatePipe, NgStyle } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SnackStatusesUtil } from '@shared/utils';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OperationsFormComponent } from '@shared/components';
import { Select } from 'primeng/select';

enum PeriodValue {
  ALL = 'all',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  TODAY = 'today'
}

enum OperationType {
  EXPENSE = 'expense',
  INCOME = 'income',
  ALL = 'all',
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    SelectButton,
    FormsModule,
    TableModule,
    Button,
    DatePipe,
    CurrencyPipe,
    Tooltip,
    NgStyle,
    Breadcrumb,
    ConfirmDialog,
    Select,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit {
  private _ref: DynamicDialogRef | undefined;

  protected _title = 'Список операций';
  private _userId: string | undefined = '';
  protected _queryParams: { period?: PeriodValue, type?: OperationType } = {
    period: PeriodValue.ALL,
    type: OperationType.ALL,
  };
  protected _operationsList = select(OperationsState.getOperations);

  protected _home = { label: 'Операции', routerLink: ['/operations'], icon: '' };
  protected _breadcrumb: Signal<MenuItem[] | undefined> = computed(() => {
    return [{ label: this._title }];
  });

  protected _typeFilters = [{
    label: 'Расходы',
    value: OperationType.EXPENSE,
  },
    {
      label: 'Доходы',
      value: OperationType.INCOME,
    },
    {
      label: 'Все',
      value: OperationType.ALL,
    }];

  protected _periodFilters = [
    {
      label: 'Сегодня',
      value: PeriodValue.TODAY,
    },
    {
      label: 'За неделю',
      value: PeriodValue.WEEK,
    },
    {
      label: 'За месяц',
      value: PeriodValue.MONTH,
    },
    {
      label: 'За год',
      value: PeriodValue.YEAR,
    },
    {
      label: 'За все время',
      value: PeriodValue.ALL,
    }];

  private _operationDialog = {
    width: '500px',
    modal: true,
    contentStyle: {
      paddingTop: '15px',
    },
    closeOnEscape: true,
    closable: true,
  };

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _dialogService = inject(DialogService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _messageService = inject(MessageService);

  private readonly _actions = createDispatchMap({
    getOperations: Transactions.GetOperations,
    deleteOperations: Transactions.DeleteOperation,
  });

  public ngOnInit(): void {
    this._userId = this._authService.getUserInfo().userId;
    this._activatedRoute.queryParams.subscribe(params => {
      this._getOperations(params);
    });
  }

  protected async _selectedTypeOrPeriod() {
    await this._router.navigate([], {
      queryParams: {
        type: this._queryParams.type,
        period: this._queryParams.period,
      },
    });
  }

  protected _editOperations(operationId: string) {
    this._ref = this._dialogService.open(OperationsFormComponent, {
      ...this._operationDialog,
      header: 'Редактирование операции',
      data: {
        id: operationId,
        isEdit: true,
      },
    });
  }

  protected _deleteOperations(id: string) {
    this._confirmationService.confirm({
      message: 'Вы уверены, что хотите удалить эту операцию?',
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
        this._actions.deleteOperations(id);
      },
    });
    this._messageService.add(SnackStatusesUtil.getStatuses(
      'success',
      'Операция успешно удалёна',
    ));
  }

  protected _createOperations() {
    this._ref = this._dialogService.open(OperationsFormComponent, {
      ...this._operationDialog,
      header: 'Создание операции',
      data: {
        isEdit: false,
      }
    });
  }

  protected _getOperations(params?: Params) {
    const selectedQuery = {
      ...this._queryParams,
    };

    if ((params?.['type'] ?? this._queryParams.type) === OperationType.ALL) {
      delete selectedQuery.type;
    } else {
      selectedQuery.type = params?.['type'] ?? this._queryParams.type;
    }
    if ((params?.['period'] ?? this._queryParams.period) === PeriodValue.ALL) {
      delete selectedQuery.period;
    } else {
      selectedQuery.period = params?.['period'] ?? this._queryParams.period;
    }

    if (Object.keys(selectedQuery).length === 0) {
      this._actions.getOperations(this._userId ?? '');
    } else {
      this._actions.getOperations(this._userId ?? '', selectedQuery);
    }
  }
}
