import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {ChartComponent, DatePickerComponent} from '@shared/components';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [BaseChartDirective, ChartComponent, DatePickerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {
  title = 'Главная';

  constructor() {

  }


}
