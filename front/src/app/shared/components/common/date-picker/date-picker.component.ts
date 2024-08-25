import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
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
  protected dateCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  private date = new Date();
  directs = 5;

  ngOnInit() {
    this.month = this.date.toLocaleDateString('default', {month: 'long'});
    this.month = this.month.charAt(0).toUpperCase() + this.month.slice(1);
  }

  onChange(e: number) {
    this.isChecked = e;
  }

  choiceDay(item: number) {
    this.day = item + ' ' + this.month;
  }

  newDirect(){
    this._dialogOpen.openWindow();
  }

  protected readonly ItemChangerDirective = ItemChangerDirective;
}
