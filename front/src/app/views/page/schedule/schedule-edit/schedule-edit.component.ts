import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePickerComponent } from '@shared/components';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CalendarEditType, CustomDay, DefaultResponseType, NotWorksDaysCalendarType } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { orderBy } from 'lodash';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { AuthService } from '@core/auth';
import { CalendarService } from '@shared/services';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { SnackStatusesUtil } from '@shared/utils';

enum SchedulePage {
  edit = 'edit',
  create = 'create',
}

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
  protected _startHour = 9;
  protected _minute: string[] = ['00', '15', '30', '45']; // Здесь потом будут храниться минуты рассчитанные из настроек шага
  protected _endHour = 18;

  protected readonly SchedulePage = SchedulePage;

  private _userId? = '';

  protected _dayState?: boolean = true;
  private _date = signal<string>('');

  protected _schedule: CalendarEditType = {} as CalendarEditType;

  protected _mySchedule: NotWorksDaysCalendarType = {
    userId: '',
    noWorkDays: [],
  };

  protected _mySchedule: CustomDay = {} as CustomDay;

  protected _pageParam = signal<string>('');
  private _pageLabel = computed(() => {
    return this._pageParam() === SchedulePage.edit
      ? 'Редактировать' : 'Создание';
  });

  protected _home = {
    label: 'Расписание',
    routerLink: ['/schedule'],
    icon: '',
  };

  protected _breadcrumb: Signal<MenuItem[] | undefined> = computed(() => {
    return [
      {
        label: `${this._pageLabel()} расписания`,
        routerLink: ['/schedule', this._pageParam()],
        style: { color: 'primary' },
      },
    ];
  });

  constructor(private readonly _activatedRoute: ActivatedRoute,
              private readonly _authService: AuthService,
              private readonly _router: Router,
              private readonly _snackBar: MessageService,
              private readonly _calendarService: CalendarService) {
  }

  public ngOnInit(): void {
    this._activatedRoute.params.subscribe((param) => {
      this._pageParam.set(param['action']);
    });
    this._userId = this._authService.getUserInfo().userId;
  }

  private _initSchedule() {
    // формировать стартовый календарь в котором будут все дни и они будут указанны как рабочие со стандартным временем
    // указанном в конфигурации
  }

  protected _checkDayState(date: string) {
    this._date.set(date);
    const findedDay: { date: string | null } | undefined = this._mySchedule?.noWorkDays.find(
      (d) => d.date === date);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    findedDay ? (this._dayState = false) : (this._dayState = true);
    console.log(this._date());
  }

  protected _choiceDay(state: boolean): void {
    const day = this._mySchedule?.noWorkDays.find((item) => item.date === this._date());
    if (!day && !state) {
      this._mySchedule.noWorkDays.push({ date: this._date() });
      this._mySchedule.noWorkDays = orderBy(
        this._mySchedule?.noWorkDays, (x) => x.date, 'asc');
    } else if (day && state) {
      this._mySchedule.noWorkDays = this._mySchedule?.noWorkDays.filter((item) => {
        return item.date !== day.date;
      });
    }
  }

  // Переделать логику этого метода, старый аннигилировать =))
  // protected _choiceDay(state: boolean): void {
  //   const day = this._mySchedule?.noWorkDays.find((item) => item.date === this._date());
  //   if (!day && !state) {
  //     this._mySchedule.noWorkDays.push({
  //       date: this._date()
  //     });
  //     this._mySchedule.noWorkDays = orderBy(
  //       this._mySchedule?.noWorkDays, (x) => x.date, 'asc');
  //   } else if (day && state) {
  //     this._mySchedule.noWorkDays = this._mySchedule?.noWorkDays.filter((item) => {
  //       return item.date !== day.date;
  //     });
  //   }
  // }

  protected _resetDays(): void {
    this._mySchedule.noWorkDays = [{ date: '' }];
  }

  protected _saveDays(): void {
    if (this._userId != null) {
      this._mySchedule.userId = this._userId;
      try {
        // empty
      } catch (e) {
        console.log(e);
      }
    }
  }

  private _formingSchedule() {
    // empty
  }

  private _createNotWorkDays(): void {
    this._calendarService.createSchedule(this._mySchedule).subscribe(result => {
      console.log(result);
    });
  }

  protected _allDaysWorking(): void {
    this._mySchedule = {
      userId: this._userId ?? '',
      noWorkDays : []
    };
    this._calendarService.createSchedule(this._mySchedule).subscribe(result => {
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
