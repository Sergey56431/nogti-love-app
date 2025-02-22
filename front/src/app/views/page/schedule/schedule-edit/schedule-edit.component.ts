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
import { ScheduleDate } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { find } from 'lodash';

enum SchedulePage {
  edit = 'edit',
  create = 'create',
}

@Component({
  selector: 'app-schedule-edit',
  standalone: true,
  imports: [Breadcrumb, DatePickerComponent, ToggleSwitch, FormsModule],
  templateUrl: './schedule-edit.component.html',
  styleUrl: './schedule-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditComponent implements OnInit {
  protected _title = 'Расписание';
  private _mySchedule: ScheduleDate = {userId: '', notWorksDay: []};
  private _date = signal<string>('');
  protected _dayState?: boolean = true;
  protected _pageParam = signal<string>('');
  private _pageLabel = computed(() => {
    return this._pageParam() === SchedulePage.edit
      ? 'Редактировать'
      : 'Создание';
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

  constructor(private readonly _activatedRoute: ActivatedRoute) {}

  public ngOnInit(): void {
    this._activatedRoute.params.subscribe((param) => {
      this._pageParam.set(param['action']);
    });

  }

  /* TODO
  - Найти причину почему в передаётся прошлая дата, а не та на которую кликаешь
  */

  protected _checkDayState(date: string) {
    this._date.set(date);
    const findedDay: string | undefined = this._mySchedule?.notWorksDay.find(d => d === date);
    !findedDay ? this._dayState = true : this._dayState = false;
    console.log(this._date());
  }

  protected _choiceDay(state: boolean): void {
    const day = find(this._mySchedule?.notWorksDay, this._date());
    if (!day && !state) {
      this._mySchedule?.notWorksDay.push(this._date());
    } else if (day && state) {
      this._mySchedule?.notWorksDay.filter((item) => {
        return item !== day;
      });
    }
  }

  protected readonly SchedulePage = SchedulePage;
}
