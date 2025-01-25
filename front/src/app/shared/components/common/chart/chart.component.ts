import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective, Menu, Button],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  protected _options = [
    { routerLink: '', label: 'Доходы' },
    { routerLink: '', label: 'Расходы' },
    { routerLink: '/operations', label: 'Детально' },
  ];

  protected pieChartOptions: ChartOptions<'doughnut'> = {
    plugins: {
      colors: {
        enabled: true,
      },
    },
    responsive: false,
  };
  protected pieChartLabels = {
    labels: ['Даходы', 'Расходы'],
  };
  protected pieChartDatasets = [
    {
      data: [235, 765],
      backgroundColor: ['#dfc49c', '#0E55DD'],
      hoverBackgroundColor: ['#f3cd8e', '#003381'],
    },
  ];
  protected pieChartLegend = true;
  protected pieChartPlugins = {
    dataLabels: {
      anchor: 'end',
      align: 'end',
    },
  };

  private _getAmounts() {
    // получение доходов и расходов за месяц
  }
}
