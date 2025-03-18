import {
  AfterViewInit,
  computed,
  Directive,
  ElementRef,
  Input,
  Renderer2,
  signal,
} from '@angular/core';
import { DayState } from '@shared/utils';
import { CalendarResponse } from '@shared/types';

@Directive({
  selector: '[ItemChanger]',
  standalone: true,
})
export class ItemChangerDirective implements AfterViewInit {
  private days = signal<CalendarResponse[]>([]) ;
  private _allDays= computed(() => {
    return this.days();
  });

  @Input() public set day(day: CalendarResponse) {
    if (day != null){
      this.days().push(day);
    }
  };

  constructor(
    private el: ElementRef,
    private rend: Renderer2,
  ) {}

  ngAfterViewInit() {
      for (const item of this._allDays()) {
        switch (item?.state) {
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
    // this.rend.setProperty(this.el.nativeElement, 'disabled', true);
    this.rend.addClass(this.el.nativeElement, 'disabled');
  }

  private _fullDay() {
    this.rend.addClass(this.el.nativeElement, 'full-day');
  }
}
