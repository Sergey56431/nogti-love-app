import { ChangeDetectorRef, Component, effect, Input, OnInit, signal } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [Menu, Button, UIChart],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements OnInit {
  protected _income = signal<number>(0);
  protected _expanse = signal<number>(0);

  @Input() set income(income: number) {
    if (income) {
      this._income.set(income);
    }
  }

  @Input() set expense(expense: number) {
    if (expense) {
      this._expanse.set(expense);
    }
  }

  protected data: unknown;

  protected options: unknown;

  protected _options = [
    { routerLink: '/operations-list', label: 'Детально' },
  ];

  constructor(private readonly _cdr: ChangeDetectorRef) {
    effect(() => {
      if (this._income()) {
        this._initChart();
      }
      if (this._expanse()) {
        this._initChart();
      }
    }, { allowSignalWrites: true });
  }

  public ngOnInit() {
    this._initChart();
  }

  private _initChart() {
    this.data = {
      labels: ['Даходы', 'Расходы'],
      datasets: [
        {
          data: [this._income(), this._expanse()],
          backgroundColor: ['#dfc49c', '#0E55DD'],
          hoverBackgroundColor: ['#f3cd8e', '#003381'],
        },
      ],
    };

    this.options = {
      cutout: '60%',
      plugins: {
        colors: {
          enabled: true,
        },
      },
      responsive: false,
    };
    this._cdr.markForCheck();
  }

}
