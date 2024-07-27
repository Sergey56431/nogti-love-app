import {Component} from '@angular/core';
import {BaseChartDirective, ThemeService} from "ng2-charts";
import {ChartOptions} from "chart.js";
import {ChartComponent} from "../../../shared/components/common/chart/chart.component";
import {DatePickerComponent} from "../../../shared/components/common/date-picker/date-picker.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [BaseChartDirective, ChartComponent, DatePickerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  title: string = 'Главная';

  constructor(private pieService: ThemeService,) {
  }


}
