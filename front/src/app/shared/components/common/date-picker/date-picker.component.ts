import {
  ChangeDetectionStrategy,
  Component, computed,
  OnInit,
  signal,
} from '@angular/core';
import { CalendarService, DirectsService } from '@shared/services';
import { createDispatchMap } from '@ngxs/store';
import { Directs } from '@core/store/directs/actions';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/auth';
import { DirectsType } from '@shared/types/directs.type';
import { CalendarResponse, DefaultResponseType } from '@shared/types';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [Button],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {

  private _ref: DynamicDialogRef | undefined;

  protected month = '';
  public day = '';
  protected _calendar: CalendarResponse[] = [];
  protected _isChecked = signal<number | null>(null);
  protected _dateCount = signal<number[]>([]);
  protected _mountCount = signal<number>(0);
  private _yearCount = signal<number>(0);
  protected _isStartMonth = computed(() => {
    return this._mountCount() > new Date().getMonth() + 1;
  });

  public directs = signal<DirectsType[]>([]);

  private _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
  });

  constructor(
    private readonly _toast: MessageService,
    private readonly _calendarService: CalendarService,
    private readonly _directService: DirectsService,
    private readonly _authService: AuthService) {
  }

  ngOnInit() {
    this._mountCount.set(new Date().getMonth() + 1);
    this._yearCount.set(new Date().getFullYear());
    const user = this._authService.getUserInfo();
      this._calendarService.fetchCalendarByUser(user.userId).subscribe((calendar) => {
        if ((calendar as DefaultResponseType).error === undefined) {
          this._calendar = calendar as CalendarResponse[];
        }
      });
      try {
        this._actions.loadDirects(user.userId);
      } catch (err) {
        console.log(err);
    }
    this._monthName(this._mountCount());
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  private _monthName(month: number) {
    this.month = new Date(0, month, 0).toLocaleDateString('ru-RU', {
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

  protected _choiceDay(day: number) {
    this.day = `${day} ${this.month}`;
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    const date = new Date(`${this._yearCount()}-${this._mountCount()}-${day}`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      .toLocaleDateString('ru-RU', options).split('.').reverse().join('-');
    this._directService.fetchDirectsByDate(date).subscribe((directs) => {
      this.directs.set(directs);
      console.log(this.directs());
    });
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
}
