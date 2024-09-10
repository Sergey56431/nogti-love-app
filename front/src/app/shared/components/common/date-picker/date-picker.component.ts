import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {NgForOf} from '@angular/common';
import {ItemChangerDirective} from '@shared/directives';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {DialogOpenService} from '@shared/services';

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


  constructor(private _dialogOpen: DialogOpenService){
  };

  protected month = '';
  protected day = '';
  protected isChecked: number | null = null;
  protected _dateCount = signal<number[]>([]);
  directs = 5;

  ngOnInit() {
    this.month = new Date().toLocaleDateString('default', {month: 'long'});
    this.month = this.month.charAt(0).toUpperCase() + this.month.slice(1);

    // первая инициаизация с актуальным месяцем и годом
    this._daysInMonth(9, 2024);
  }

  onChange(e: number) {
    this.isChecked = e;
  }

  protected _choiceMonth() {


    // вызов функции я получения всех дней в выбранном месяце
    // this._daysInMonth()
  }

  choiceDay(item: number) {
    this.day = item + ' ' + this.month;
  }

  newDirect(){
    this._dialogOpen.openWindow();
  }

  private _daysInMonth(month: number, year: number) {
    const days = new Date(year, month, 0).getDate();
    for (let i = 1; i <= days; i++) {
      this._dateCount().push(i);
    }
    console.log(this._dateCount);
  };

  // protected _getDirects() {
  // запрос на сервер для получения записей на выыбраный день
  // }

  protected readonly ItemChangerDirective = ItemChangerDirective;
}
