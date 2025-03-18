import {
  ChangeDetectionStrategy,
  Component,
  computed, EventEmitter,
  OnInit, Output,
  signal,
} from '@angular/core';
import { CalendarService, DirectsService } from '@shared/services';
import { createDispatchMap } from '@ngxs/store';
import { Directs } from '@core/store/directs/actions';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/auth';
import { CalendarResponse, DefaultResponseType } from '@shared/types';
import { ProgressStatuses, SnackStatusesUtil } from '@shared/utils';
import { ItemChangerDirective } from '@shared/directives';
import { DirectsClientType } from '@shared/types/directs-client.type';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [Button, ItemChangerDirective],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {
  protected _render = signal<boolean>(false);

  protected month = '';
  public day = '';
  public choiceDate = signal<string>('');
  public selectedDate = signal<string>('');
  protected _calendar = signal<CalendarResponse[]>([]);
  protected _isChecked = signal<CalendarResponse | null>(null);
  protected _date = signal<CalendarResponse[]>([]);
  public _mountCount = signal<number>(0);
  public _yearCount = signal<number>(0);
  protected _isStartMonth = computed(() => {
    return this._mountCount() > new Date().getMonth() + 1;
  });

  public directs = signal<DirectsClientType[]>([]);

  private _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
  });

  @Output() selectedDay = new EventEmitter<CalendarResponse>();
  @Output() emitDate = new EventEmitter<string>();
  @Output() startDate = new EventEmitter<string>();

  constructor(
    private readonly _toast: MessageService,
    private readonly _calendarService: CalendarService,
    private readonly _directService: DirectsService,
    private readonly _authService: AuthService,
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
    const user = this._authService.getUserInfo() ;
    if (user && user.userId) {
      this._calendarService
        .fetchCalendarByUser(user.userId)
        .subscribe((calendar) => {
          if ((calendar as DefaultResponseType).error === undefined) {
            this._calendar.set(calendar as CalendarResponse[]);
            this._setStateOfDate(calendar as CalendarResponse[]);
          }
        });

    }
  }

  // Функция выбора месяца с автоматическим инкрементом или декрементом года
  protected _choiceMonth(select: string) {
    this._render.set(false);
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

  // функция выбора даты с последующей отправкой запроса на получение всех записей в этот день
  protected _choiceDay(day: number) {
    this.choiceDate.set(`${this._yearCount()}-${this._mountCount() > 9 ? this._mountCount() : '0' + this._mountCount()}-${day > 9 ? day : '0' + day}`);
    this.day = `${day} ${this.month}`;
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    this.emitDate.emit(this.choiceDate());
    const date = new Date(`${this._yearCount()}-${this._mountCount()}-${day}`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      .toLocaleDateString('ru-RU', options)
      .split('.')
      .reverse()
      .join('-');
    this.selectedDate.set(date);
    this.fetchDirectsToDay(date);
  }

  public fetchDirectsToDay(date: string) {
    const user = this._authService.getUserInfo();
    if (user && user.userId) {
      this._directService.fetchDirectsByDateUser(date, user.userId).subscribe((directs) => {
        this.directs.set(directs as DirectsClientType[]);
        console.log(this.directs());
      });
    }
  }

  // Функция генерации календаря
  private _daysInMonth(month: number, year: number): string {
    const days = new Date(year, month, 0).getDate();
    this.startDate.emit(`${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${days}`);
    this._date.set([]);
    for (let i = 1; i <= days; i++) {
      this._date().push({
        day: i,
        date: `${i.toString().padStart(2, '0')}.${this._mountCount().toString().padStart(2, '0')}.${this._yearCount()}`,
      });
    }
    this._fetchUserFullCalendar();
    return 'success';
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
          Object.assign(i, {
            id: item.id,
            freeSlots: item.freeSlots,
            state: item.state });
        }
      });
    }
    this._render.set(true);
  }

  // Функция выбора и передачи информации об этом дне в родительский компонент
  protected _selectDay(day: CalendarResponse) {
    this.selectedDay.emit(day);
    this._isChecked.set(day);
  }

  // Метод для обновления календаря без перезагрузки страницы
  public _refreshDatePicker() {
    const result = this._daysInMonth(this._mountCount(), this._yearCount());
    this._setStateOfDate(this._calendar());
    let message = undefined;
    if (result === ProgressStatuses.SUCCESS) {
      message = SnackStatusesUtil.getStatuses(result);
    }
    if (message) {
      this._toast.add(message);
    }
  }

}
