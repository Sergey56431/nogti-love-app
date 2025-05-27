import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ChartComponent } from '@shared/components';
import { ScheduleMainComponent } from '@shared/components/schedule-main/schedule-main.component';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationsState, Transactions } from '@core/store';
import { AuthService } from '@core/auth';
import { UserInfoType } from '@shared/types';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ChartComponent,
    ScheduleMainComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  protected title = 'Главная';
  protected _income = signal<number>(0);
  protected _expanse = signal<number>(0);
  private _userInfo?: UserInfoType;


  private _operationsList = computed(() => {
    return this._operations();
  });

  private _operations = select(OperationsState.getOperations);

  private readonly _authService = inject(AuthService);

  private _actions = createDispatchMap({
    getOperations: Transactions.GetOperations,
  });

  constructor() {
    effect(() => {
      this._operationsList()?.forEach(item => {
        if (item.categoryOperations.type === 'income') {
          this._income.update(prev => prev + item.value);
        }
        if (item.categoryOperations.type === 'expense') {
          this._expanse.update(prev => prev + item.value);
        }
      });
      if (this._operationsList().length === 0) {
        console.log(this._operationsList());
        this._income.set(0);
        this._expanse.set(0);
      }
    }, { allowSignalWrites: true });
  }

  public ngOnInit() {
    this._userInfo = this._authService.getUserInfo();
    this._fetchOperation();
  }

  protected _fetchOperation(period?: string[]) {
    const query = period ? {dateFrom: period[0], dateTo: period[1]} : null;
    this._actions.getOperations(this._userInfo?.userId ?? '', query ?? {});
  };
}
