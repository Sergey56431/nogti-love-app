import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {NgForOf} from '@angular/common';
import {ItemChangerDirective} from '@shared/directives';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {CalendarService, DialogOpenService} from '@shared/services';
import {createDispatchMap, select, Store} from '@ngxs/store';
import {Directs} from '@core/store/directs/actions';
import {UsersActions} from '@core/store';
import {UserState} from '@core/store/dashboard/states/user/user.state';
import {DirectsState} from '@core/store/directs/store';
import {DirectsClientType} from '@shared/types/directs-client.type';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    NgForOf,
    ItemChangerDirective,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerComponent implements OnInit{

  constructor(private _dialogOpen: DialogOpenService,
              private _store: Store,
              private readonly _calendarService: CalendarService){
  };
  private _user = select(UserState.getUser);
  private _directs = select(DirectsState.getDirects);
  protected month = '';
  protected day = '';
  protected isChecked: number | null = null;
  protected _dateCount = signal<number[]>([]);
  private _mountCount = signal<number>(0);
  private _yearCount = signal<number>(0);
  protected _clientsList: DirectsClientType[] = [];
  directs = 5;// по мер е расширения проекта переделать эту переменную

  private _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
    loadUser: UsersActions.GetUser,
  });

  ngOnInit() {
    this._mountCount.set(new Date().getMonth() + 1);
    this._yearCount.set(new Date().getFullYear());
    const userId = localStorage.getItem('userId');
    this._calendarService.getDirects(userId!).subscribe(directs => {
      console.log(directs);
    });
    try {
      this._actions.loadDirects(userId!);
      console.log(this._directs());
    } catch (err) {
      console.log(err);
    }

    this._monthName(this._mountCount());
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  onChange(e: number) {
    this.isChecked = e;
  }

  private _monthName (month: number) {
    this.month = new Date(0,month, 0).toLocaleDateString('default', {month: 'long'});
    this.month = this.month.charAt(0).toUpperCase() + this.month.slice(1);
  }

  protected _choiceMonth(select: string) {
    switch (select){
      case 'next':
        this._mountCount.update(value => value + 1);
        if (this._mountCount() > 12){
          this._mountCount.set(1);
          this._yearCount.update(value => value + 1);
        }
        break;
      case 'prev':
        this._mountCount.update(value => value - 1);
        if (this._mountCount() < 1){
          this._mountCount.set(12);
          this._yearCount.update(value => value - 1);
        }
        break;
      default:
        console.log('Невозможно выбрать месяц');
    }
    this._monthName(this._mountCount());
   console.log(this._mountCount() + ' ' + this._yearCount());
    // вызов функции я получения всех дней в выбранном месяце
    this._daysInMonth(this._mountCount(), this._yearCount());
  }

  choiceDay(item: number) {
    this.day = item + ' ' + this.month;
  }

  newDirect(){
    this._dialogOpen.openWindow();
  }

  private _daysInMonth(month: number, year: number) {
    const days = new Date(year, month, 0).getDate();
    this._dateCount.set([]);
    for (let i = 1; i <= days; i++) {
      this._dateCount().push(i);
    }
  };

  protected _getDirects(day: number, month: number,) {

    // получение записей на выбранный день
  }

  protected _refreshDatePicker () {
    this._daysInMonth(this._mountCount(), this._yearCount());
    console.log('Календаь обновлён');
    // Метод ля обновления календаря без перезагрузки страницы
  }
}
