import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AuthService } from '@core/auth';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationsState, Transactions } from '@core/store';

enum PeriodValue {
  ALL= 'all',
  WEEK= 'week',
  MONTH= 'month',
  YEAR= 'year',
  TODAY= 'today'
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
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit {
  protected _title = 'Список операций';
  protected _period = '';
  protected _type = '';
  private _userId: string | undefined = '';
  private readonly _queryParams: string[] = [];
  protected _operationsList = select(OperationsState.getOperations);

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

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  private readonly _actions = createDispatchMap({
    getOperations: Transactions.GetOperations
  });

  public ngOnInit(): void {
    this._userId = this._authService.getUserInfo().userId;
    this._actions.getOperations(this._queryParams, this._userId ?? '');
    this._activatedRoute.queryParams.subscribe(params => {
      this._period = params['period'];
      this._type = params['type'];
    });
  }

  protected async _selectedTypeOrPeriod() {
    await this._router.navigate([], {queryParams: {type: this._type, period: this._period}});
  }

  /*TODO:
  * - Реализация логики должна быть с помощью ngxs
  * - Написать тесты
  */

  protected _editOperations() {
    // Здесь будет логика вызова окна для редактирования операции
  }

  protected _deleteOperations() {
    // Здесь будет логика для удаления операции
  }

  protected _createOperations() {
    // Логика для создания операции
  }

  protected _getOperations() {
    // Логика для получения операций
  }

}
