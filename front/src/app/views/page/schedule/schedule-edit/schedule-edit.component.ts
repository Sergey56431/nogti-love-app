import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { DatePickerComponent } from '@shared/components';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { NotWorksDaysCalendarType } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { orderBy } from 'lodash';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { AuthService } from '@core/auth';
import { CalendarService } from '@shared/services';

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
  ],
  templateUrl: './schedule-edit.component.html',
  styleUrl: './schedule-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditComponent implements OnInit {
  protected _title = 'Расписание';

  protected readonly SchedulePage = SchedulePage;

  private _userId? = '';

  protected _dayState?: boolean = true;
  private _date = signal<string>('');
  protected _mySchedule: NotWorksDaysCalendarType = {
    userId: '',
    noWorkDays: [],
  };

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
              private readonly _calendarService: CalendarService) {}

  public ngOnInit(): void {
    this._activatedRoute.params.subscribe((param) => {
      this._pageParam.set(param['action']);
    });
    this._userId = this._authService.getUserInfo().userId;
  }

  protected _checkDayState(date: string) {
    this._date.set(date);
    const findedDay: { date: string} | undefined = this._mySchedule?.noWorkDays.find(
      (d) => d.date === date,);
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

  protected _resetDays(): void {
    this._mySchedule.noWorkDays = [{ date: ''}];
  }

  protected _saveDays(): void {
    if (this._userId != null) {
      this._mySchedule.userId = this._userId;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this._pageParam() !== SchedulePage.create ? this._editSchedule() : this._createNotWorkDays();
      }
      catch (e) {
        console.log(e);
      }
    }
  }

  private _createNotWorkDays(): void {
    this._calendarService.createSchedule(this._mySchedule).subscribe(result => {
      console.log(result);
    });
  }

  private _editSchedule(): void {
    // нужно создать поток, который будет поочерёдно отправлять все выбранные для редактирования дни на сервер
  }
}
