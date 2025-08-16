import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit, output,
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
import { DirectsClientType } from '@shared/types/directs-client.type';
import { ItemChangerDirective } from '@shared/directives';

@Component({
  selector: 'app-date-picker',
  imports: [Button, ItemChangerDirective],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {
  // --- Signals & State ---
  protected readonly _render = signal<boolean>(false);
  private readonly _calendar = signal<CalendarResponse[]>([]);
  protected readonly _isChecked = signal<CalendarResponse | null>(null);
  protected readonly _date = signal<CalendarResponse[]>([]);
  protected readonly _mountCount = signal<number>(0);
  protected readonly _yearCount = signal<number>(0);
  private readonly _directs = signal<DirectsClientType[]>([]);
  private readonly _choiceDate = signal<string>('');
  private readonly _selectedDate = signal<string>('');

  // --- Simple fields ---
  protected _month = '';
  protected _day = '';

  // --- Computed ---
  protected readonly _isStartMonth = computed(() => this._mountCount() > new Date().getMonth() + 1);

  // --- Outputs ---
  public selectedDay = output<CalendarResponse>();
  public emitDate = output<string>();
  public startDate = output<string>();

  // --- Actions ---
  private readonly _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
  });

  // --- Публичные геттеры для доступа из других компонентов и шаблонов ---
  public get day() {
    return this._day;
  }

  public get month() {
    return this._month;
  }

  public get selectedDate() {
    return this._selectedDate();
  }

  public get directs() {
    return this._directs();
  }

  constructor(
    private readonly _toast: MessageService,
    private readonly _calendarService: CalendarService,
    private readonly _directService: DirectsService,
    private readonly _authService: AuthService,
  ) {
  }

  /**
   * Инициализация компонента (стартовый месяц и запрос получения всех рабочих дней пользователя)
   */
  public ngOnInit(): void {
    this._mountCount.set(new Date().getMonth() + 1);
    this._yearCount.set(new Date().getFullYear());
    this._updateCalendarState();
  }

  /**
   * Обновляет состояние календаря: получает календарь пользователя, устанавливает месяц и дни
   */
  private _updateCalendarState(): void {
    this._fetchUserFullCalendar(() => {
      this._setMonthName(this._mountCount());
      this._generateDaysInMonth(this._mountCount(), this._yearCount());
    });
  }

  /**
   * Определяет наименование выбранного месяца
   */
  private _setMonthName(month: number): void {
    this._month = new Date(0, month, 0).toLocaleDateString('ru-RU', { month: 'long' });
    this._month = this._month.charAt(0).toUpperCase() + this._month.slice(1);
  }

  /**
   * Запрашивает календарь пользователя и вызывает callback после получения
   */
  private _fetchUserFullCalendar(callback?: () => void): void {
    const user = this._authService.getUserInfo();
    if (user?.userId) {
      this._calendarService.fetchCalendarByUser(user.userId).subscribe((calendar) => {
        if (!(calendar as DefaultResponseType).error) {
          this._calendar.set(calendar as CalendarResponse[]);
          if (callback) callback();
        }
      });
    } else if (callback) {
      callback();
    }
  }

  /**
   * Функция выбора месяца с автоматическим инкрементом или декрементом года
   */
  public changeMonth(direction: 'next' | 'prev'): void {
    this._render.set(false);
    if (direction === 'next') {
      this._mountCount.update((v) => v + 1);
      if (this._mountCount() > 12) {
        this._mountCount.set(1);
        this._yearCount.update((v) => v + 1);
      }
    } else if (direction === 'prev') {
      this._mountCount.update((v) => v - 1);
      if (this._mountCount() < 1) {
        this._mountCount.set(12);
        this._yearCount.update((v) => v - 1);
      }
    } else {
      console.error('Невозможно выбрать месяц');
    }
    this._updateCalendarState();
  }

  /**
   * Функция выбора даты с последующей отправкой запроса на получение всех записей в этот день
   */
  public selectDayByNumber(day: number): void {
    const dateStr = `${this._yearCount()}-${this._mountCount().toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    this._choiceDate.set(dateStr);
    this._day = `${day.toString().padStart(2, '0')} ${this._month}`;
    this.emitDate.emit(this._choiceDate());
    const formattedDate = this._formattedDate(new Date(dateStr));
    this._selectedDate.set(formattedDate);
    this.fetchDirectsToDay(formattedDate);
  }


  private _formattedDate(date: Date): string {
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .split('.')
      .reverse()
      .join('-');
  }

  /**
   * Получает направления пользователя на выбранную дату
   */
  public fetchDirectsToDay(date: string): void {
    const user = this._authService.getUserInfo();
    if (user?.userId && date) {
      this._directService.fetchDirectsByDateUser(date, user.userId).subscribe((directs) => {
        this._directs.set(directs as DirectsClientType[]);
      });
    }
  }

  /**
   * Генерирует календарь на месяц
   */
  private _generateDaysInMonth(month: number, year: number): void {
    const days = new Date(year, month, 0).getDate();
    this.startDate.emit(`${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${days}`);
    this._date.set([]);
    for (let i = 1; i <= days; i++) {
      const date = `${this._yearCount()}-${this._mountCount().toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const dayOfWeek = new Date(date).getDay();
      if (i === 1 && dayOfWeek !== 1) {
        for (let j = 0; j < (dayOfWeek + 6) % 7; j++) {
          this._date().push({ day: 0 });
        }
      }
      this._date().push({
        day: i,
        date: date,
        dayOfWeek: dayOfWeek,
      });
    }
    this._setStateOfDate(this._calendar());
  }

  /**
   * Устанавливает состояние дня
   */
  private _setStateOfDate(calendar: CalendarResponse[]): void {
    for (const item of calendar) {
      if (item.date) {
        const date = this._formattedDate(new Date(item.date));
        this._date().find((i) => {
          if (i.date === date) {
            Object.assign(i, {
              id: item.id,
              freeSlots: item.freeSlots,
              state: item.state,
            });
          }
        });
      }
    }
    this._render.set(true);
  }

  /**
   * Выбор и передача информации о дне в родительский компонент
   */
  public selectDay(day: CalendarResponse): void {
    this.selectedDay.emit(day);
    this._isChecked.set(day);
  }

  /**
   * Обновляет календарь без перезагрузки страницы
   */
  public refreshDatePicker(): void {
    this._generateDaysInMonth(this._mountCount(), this._yearCount());
    this._setStateOfDate(this._calendar());
    let message = undefined;
    if (ProgressStatuses.SUCCESS) {
      message = SnackStatusesUtil.getStatuses(ProgressStatuses.SUCCESS);
    }
    if (message) {
      this._toast.add(message);
    }
  }
}
