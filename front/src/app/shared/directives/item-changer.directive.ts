import {
  Directive,
  ElementRef,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DayState } from '@shared/utils';
import { CalendarResponse } from '@shared/types';

@Directive({
  selector: '[ItemChanger]',
  standalone: true,
})
export class ItemChangerDirective implements OnInit {
  day = input.required<CalendarResponse>(); // Используем input()

  constructor(
    private el: ElementRef,
    private rend: Renderer2,
  ) {}

  ngOnInit() {
    const item = this.day();
    if (item.date) {
      const [year, month, day] = item.date?.split('-').map(Number) ?? [];
      const dayOfWeek = new Date(year, month - 1 , day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this._freeDay();
      }

      switch (item.state) {
        case DayState.NOT_WORKING:
          this._disabledDate();
          break;
        case DayState.FULL:
          this._fullDay();
          break;
        default:
          break;
      }
    }
  }

  private _disabledDate() {
    this.rend.addClass(this.el.nativeElement, 'disabled');
  }

  private _fullDay() {
    this.rend.addClass(this.el.nativeElement, 'full-day');
  }

  private _freeDay() {
    this.rend.addClass(this.el.nativeElement, 'free-day');
  }
}
