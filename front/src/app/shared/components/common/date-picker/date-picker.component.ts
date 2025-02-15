import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { CalendarService, DirectsService } from '@shared/services';
import { createDispatchMap } from '@ngxs/store';
import { Directs } from '@core/store/directs/actions';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/auth';
import { DirectsType } from '@shared/types/directs.type';
import { CalendarResponse, DefaultResponseType } from '@shared/types';
import { DayState } from '@shared/utils';
import { NgClass } from '@angular/common';
import { ItemChangerDirective } from '@shared/directives';

export interface CalendarDay {
  day: number;
  date: string;
  state?: DayState;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [Button, NgClass, ItemChangerDirective],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {
  public loading = signal<boolean>(false);

  private _ref: DynamicDialogRef | undefined;

  protected month = '';
  public day = '';
  protected _calendar = signal<CalendarResponse[]>([]);
  protected _isChecked = signal<number | null>(null);
  protected _date = signal<CalendarDay[]>([]);
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
    private readonly _authService: AuthService,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  // Инициализация компонента (стартовый месяц и запроса получение всех дней рабочих дней юзера)
  ngOnInit() {
    this._mountCount.set(new Date().getMonth() + 1);
    this._yearCount.set(new Date().getFullYear());
    this._fetchUserFullCalendar();
    this._monthName(this._mountCount());
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  // Определение наименования выбранного месяца
  private _monthName(month: number) {
    this.month = new Date(0, month, 0).toLocaleDateString('ru-RU', {
      month: 'long',
    });
    this.month = this.month.charAt(0).toUpperCase() + this.month.slice(1);
  }

  // Запрос всего календаря для пользователя
  private _fetchUserFullCalendar(): void {
    const user = this._authService.getUserInfo();
    this._calendarService
      .fetchCalendarByUser(user.userId)
      .subscribe((calendar) => {
        if ((calendar as DefaultResponseType).error === undefined) {
          this._calendar.set(calendar as CalendarResponse[]);
          this._setStateOfDate(calendar as CalendarResponse[]);
        }
      });
  }

  // Функция выбора месяца с автоматическим инкрементом или декрементом года
  protected _choiceMonth(select: string) {
    console.log(this._calendar());
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
    this._fetchUserFullCalendar();
    this._monthName(this._mountCount());
    // вызов функции я получения всех дней в выбранном месяце
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  // функция выбора даты с последующей отправкой запроса на получение всех записей в  этот день
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
      .toLocaleDateString('ru-RU', options)
      .split('.')
      .reverse()
      .join('-');

    this._directService.fetchDirectsByDate(date).subscribe((directs) => {
      this.directs.set(directs);
      console.log(this.directs());
    });
  }

  //Закрытие диалога
  protected _closeDialog() {
    this._ref?.close();
  }

  // Функция генерации календаря
  private _daysInMonth(month: number, year: number) {
    const days = new Date(year, month, 0).getDate();
    this._date.set([]);
    for (let i = 1; i <= days; i++) {
      this._date().push({
        day: i,
        date: `${i > 9 ? i : '0' + i}.${this._mountCount() > 9 ? this._mountCount() : '0' + this._mountCount()}.${this._yearCount()}`,
      });
    }
  }

  // Установка состояния дня
  private _setStateOfDate(calendar: CalendarResponse[]): void {
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    for (const item of calendar) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const date = new Date(item.date).toLocaleDateString('ru-RU', options);
      this._date().find((i) => {
        if (i.date === date) {
          Object.assign(i, { state: item.state });
        }
      });
    }
  }

  //Определение класса дня
  protected _dayStateClass(day: CalendarDay): string {
    switch (day.state) {
      case DayState.NOT_WORKING:
        return 'not-working';
      case DayState.FULL:
        return 'full-day';
      default:
        return '';
    }
  }

  // Метод для обновления календаря без перезагрузки страницы
  public _refreshDatePicker() {
    this._daysInMonth(this._mountCount(), this._yearCount());

    // Нужно сюда подставлять варианты в зависимости от выполнения обновления календаря
    this._toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Календарь обновлён',
      life: 3000,
    });
  }

  protected readonly DayState = DayState;
}
