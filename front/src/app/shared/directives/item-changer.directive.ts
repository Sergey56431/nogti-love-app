import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2, signal,
} from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: '[ItemChanger]',
  standalone: true,
})
export class ItemChangerDirective implements OnInit {
  private _month = signal<number | undefined>(undefined);

  @Input() public set date (month: number) {
    if (month) {
      this._month.set(month);
      console.log(month);
    }
  };
  @Input() month?: number;
  private changeMonth$ = new Subject<number>();
  @Input() changeMonth = this.changeMonth$.asObservable();

  constructor(private el: ElementRef,
              private rend: Renderer2) {
  }

  ngOnInit() {
    this.changeMonth.subscribe((month) => {
      console.log(month);
      this.changeMonth$.next(month);
    });
    this.disabledDate();
  }

  private nowDate = new Date().getDate();
  private nowMonth = new Date().getMonth() + 1;

  disabledDate() {
    console.log(this.date, this.month);
    if ((this.date <= this.nowDate && this.nowMonth > this.month!) ||
      (this.date <= this.nowDate && this.nowMonth === this.month) ) {
      this.rend.setProperty(this.el.nativeElement, 'disabled', true);
    }
  }

  @HostListener('click')
  onClick(): void {
    if (this.el.nativeElement.classList.contains('disabled')) {
      return;
    }
  }


}
