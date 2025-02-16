import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {ChartComponent, DatePickerComponent} from '@shared/components';
import { ScheduleMainComponent } from '@shared/components/schedule-main/schedule-main.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    BaseChartDirective,
    ChartComponent,
    DatePickerComponent,
    ScheduleMainComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  title = 'Главная';

}
