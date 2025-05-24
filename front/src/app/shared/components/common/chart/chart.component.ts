import { ChangeDetectorRef, Component, computed, effect, Input, OnInit, signal } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { PeriodUtils } from '@shared/utils';

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

  protected _date = computed(() => {
    console.log(this._year(), this._month());
    return new Date(this._year(), this._month(), 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  });

  protected _month = signal<number>(new Date().getMonth());
  private _year = signal<number>(new Date().getFullYear());

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
    this._selectPeriod();
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

  protected _updateDate(value: number) {
    if (value) {
      this._month.update(v => v + value);
    }
    if (this._month() > 12) {
      this._month.set(1);
      this._year.update(v => v + 1);
    }
    if (this._month() < 1) {
      this._month.set(12);
      this._year.update(v => v - 1);
    }
    this._selectPeriod();
  }

  protected _selectPeriod() {
    const date = PeriodUtils.convertMonths(this._month(), this._year());
    // реализовать запрос через стор для получения операций по месяцу
    console.log(date);
  }

}
