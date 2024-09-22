import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[ItemChanger]',
  standalone: true,
})
export class ItemChangerDirective implements OnInit {

  @Input() date = 0;

  constructor(private el: ElementRef,
              private rend: Renderer2) {
  }

  ngOnInit() {
    // this.disabledDate(this.date);
  }

  private nowDate = new Date().getDate();

  // disabledDate(date: number) {
  //   if (date <= this.nowDate) {
  //     this.rend.setProperty(this.el.nativeElement, 'disabled', true);
  //   }
  // }

  @HostListener('click')
  onClick(): void {
    if (this.el.nativeElement.classList.contains('disabled')) {
      return;
    }
  }
}
