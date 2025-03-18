import { ChangeDetectionStrategy, Component, computed, OnInit, signal, Signal } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePickerComponent } from '@shared/components';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CalendarEditType, CustomDay, DefaultResponseType } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { AuthService } from '@core/auth';
import { CalendarService } from '@shared/services';
import { InputNumber } from 'primeng/inputnumber';
import { DayState, SnackStatusesUtil } from '@shared/utils';
import { createDispatchMap, Store } from '@ngxs/store';
import { SettingsActions, SettingsState } from '@core/store';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-schedule-edit',
  standalone: true,
  imports: [
    Breadcrumb,
    DatePickerComponent,
    ToggleSwitch,
    FormsModule,
    TableModule,
    Button,
    InputNumber,
    Select,
  ],
  templateUrl: './schedule-edit.component.html',
  styleUrl: './schedule-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditComponent implements OnInit {
  protected _title = 'Расписание';
  protected _startHour = 0;
  protected _minute: string[] = [];
  protected _endHour = 0;
  protected _startMinute = signal<string>('00');
  protected _endMinute = signal<string>('00');
  protected _startDate = signal<string>('');

  private readonly _settings = this._store.selectSignal(SettingsState.getSettings);
  // @Select(SettingsState.getSettings) config$?: Observable<SettingsType>;
  // private readonly _settings = signal<SettingsType | undefined>(undefined);
  protected _adminSetting = computed(() => {
    this._actions.getSettings(this._userId ?? '');
    return this._settings();
  });

  private _userId? = '';
  protected _dayState?: boolean = true;

  private _date = signal<string>('');
  protected _mySchedule: CustomDay | undefined = {} as CustomDay;
  protected _schedule = signal<CalendarEditType>({
    userId: '',
    customDays: [],
    dateForCreate: '',
  });
  protected _scheduleCustom = computed(() => {
    return this._schedule();
  });

  protected _home = {
    label: 'Расписание',
    routerLink: ['/schedule'],
    icon: '',
  };

  protected _breadcrumb: Signal<MenuItem[] | undefined> = computed(() => {
    return [
      {
        label: 'Выставление расписания',
        routerLink: ['/schedule'],
        style: { color: 'primary' },
      },
    ];
  });

  constructor(private readonly _authService: AuthService,
              private readonly _router: Router,
              private readonly _store: Store,
              private readonly _snackBar: MessageService,
              private readonly _calendarService: CalendarService) {
  }

  private _actions = createDispatchMap({
    getSettings: SettingsActions.GetSettings,
  });

  public ngOnInit(): void {
    this._userId = this._authService.getUserInfo().userId;
    this._actions.getSettings(this._userId ?? '');
    this._formingSchedule();
  }

  private _recountMinute() {
    if (this._minute.length !== 0) {
      return;
    }
    if (this._adminSetting()) { // undefined
      const step = Number(this._settings()?.timeGranularity.split(':')[1]);
      for (let i = 0; i < 60; i += step) {
        this._minute.push(i.toString());
      }
    }
  }

  private _setMyWorkTime(day: CustomDay) {
    return day.workTime?.split('-').flatMap(time => {
      return [time.split(':')[0], time.split(':')[1]];
    }).filter(item => item !== '00');
  }

  protected _checkDayState(date: string) {
    this._recountMinute();
    this._date.set(date);
    const findedDay: CustomDay | undefined = this._schedule()?.customDays?.find(
      (d) => d.date === date);
    this._dayState = findedDay?.state === DayState.WORKING;
    if (findedDay){
      const time = this._setMyWorkTime(findedDay);
      console.log(findedDay);
      this._startHour = Number(time![0]);
      this._endHour = Number(time![1]);
    }
  }

  protected _choiceDay(): void {
    this._mySchedule = this._scheduleCustom()?.customDays.find((item) => item.date === this._date());
    // Исправить работу этого метода, он должен при выборе дня менять его статус на рабочий или не рабочий в зависимости от тригера
    if (this._mySchedule) {
      this._mySchedule = {
        date: this._date(),
        workTime: this._startHour.toString().padStart(2, '0') + ':' + this._startMinute() + '-'
          + this._endHour.toString().padStart(2, '0') + ':' + this._endMinute(),
        state: this._dayState ? DayState.WORKING : DayState.NOT_WORKING,
      };
      this._changeDayInfo();
      console.log(this._scheduleCustom());
    }
  }

  private _changeDayInfo() {
    this._schedule().customDays = this._schedule()?.customDays.map(day => {
     if (day.date === this._mySchedule?.date) {
       return { ...this._mySchedule };
     }
     return { ...day };
   });
  }

  // Сделать все дни по дефолту рабочими и с дефолтным временем
  protected _resetDays(): void {
    this._formingSchedule();
  }

  protected _formingSchedule() {
    this._schedule().customDays = [];
    const date = this._startDate();
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();
    const days = new Date(year, month, 0).getDate();
    this._schedule().userId = this._userId ?? '';
    this._schedule().dateForCreate = this._startDate().split('-').slice(0,2).join('-');
    for (let i = 1; i <= days; i++) {
      this._schedule().customDays.push({
        date: `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
        workTime: this._adminSetting()?.defaultWorkTime ?? '',
        state: DayState.WORKING,
      });
    }
  }

  protected _createSchedule(): void {
    this._calendarService.createSchedule(this._scheduleCustom()).subscribe(result => {
      if ((result as DefaultResponseType).error === undefined) {
        const successMessage = SnackStatusesUtil.getStatuses('success', 'Расписание успешно выставлено');
        this._snackBar.add(successMessage);
        this._router.navigate(['/schedule']);
      } else {
        const errorMessage = SnackStatusesUtil.getStatuses('error', 'Ошибка при выставлении расписания');
        this._snackBar.add(errorMessage);
      }
    });
  }
}
