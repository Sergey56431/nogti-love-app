import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { CalendarService } from '@shared/services';
import { createDispatchMap, select, Store } from '@ngxs/store';
import { Directs } from '@core/store/directs/actions';
import { UserState } from '@core/store/dashboard/states/user/user.state';
import { DirectsState } from '@core/store/directs/store';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [Menu, Button],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {

  constructor(
    private  readonly _dialogOpen: DialogService,
    private readonly _store: Store,
    private readonly _toast: MessageService,
    private readonly _calendarService: CalendarService,
  ) {
  }

  private _ref: DynamicDialogRef | undefined;

  private _user = select(UserState.getUser);
  private _directs = select(DirectsState.getDirects);
  protected month = '';
  public day = '';
  protected _isChecked = signal<number | null>(null);
  protected _dateCount = signal<number[]>([]);
  protected _mountCount = signal<number>(0);
  private _yearCount = signal<number>(0);

  private _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
  });

  ngOnInit() {
    this._mountCount.set(new Date().getMonth() + 1);
    this._yearCount.set(new Date().getFullYear());
    const userId = localStorage.getItem('userId');
    this._calendarService.getAllDirects().subscribe((directs) => {
      console.log(directs);
    });
    try {
      this._actions.loadDirects(userId!);
    } catch (err) {
      console.log(err);
    }

    this._monthName(this._mountCount());
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  private _monthName(month: number) {
    this.month = new Date(0, month, 0).toLocaleDateString('default', {
      month: 'long',
    });
    this.month = this.month.charAt(0).toUpperCase() + this.month.slice(1);
  }

  protected _choiceMonth(select: string) {
    switch (select) {
      case 'next':
        this._mountCount.update((value) => value + 1);
        if (this._mountCount() > 12) {
          this._mountCount.set(1);
          this._yearCount.update((value) => value + 1);
        }
        break;
      case 'prev':
        this._mountCount.update((value) => value - 1);
        if (this._mountCount() < 1) {
          this._mountCount.set(12);
          this._yearCount.update((value) => value - 1);
        }
        break;
      default:
        console.log('Невозможно выбрать месяц');
    }
    this._monthName(this._mountCount());
    // вызов функции я получения всех дней в выбранном месяце
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  choiceDay(item: number) {
    this.day = item + ' ' + this.month;
  }

  protected _closeDialog() {
    this._ref?.close();
  }

  private _daysInMonth(month: number, year: number) {
    const days = new Date(year, month, 0).getDate();
    this._dateCount.set([]);
    for (let i = 1; i <= days; i++) {
      this._dateCount().push(i);
    }
  }

  public _refreshDatePicker() {
    this._daysInMonth(this._mountCount(), this._yearCount());

    this._toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Календарь обновлён',
      life: 3000,
    });
    // Метод для обновления календаря без перезагрузки страницы
  }

  // protected _getDirects(day: number, month: number) {
  //   // получение записей на выбранный день
  // }

}
