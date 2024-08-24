import { Component } from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {ChartOptions} from "chart.js";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    BaseChartDirective,
    MatMenu,
    MatButton,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {

  protected pieChartOptions: ChartOptions<'pie'> = {
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
  protected pieChartDatasets = [{
    data: [235, 765],
    backgroundColor: ['#dfc49c', '#00379e'],
    hoverBackgroundColor: ['#f3cd8e', '#0649c5'],
  }];
  protected pieChartLegend = true;
  protected pieChartPlugins = {
    datalabels: {
      anchor: 'end',
      align: 'end',
    }
  };




}
