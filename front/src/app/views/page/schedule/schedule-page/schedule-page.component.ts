import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Slider } from 'primeng/slider';
import { Status } from '@shared/utils';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { ClientCardComponent } from '@shared/components';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [
    DatePicker,
    ReactiveFormsModule,
    Checkbox,
    Slider,
    FormsModule,
    RouterLink,
    Button,
    ClientCardComponent,
  ],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePageComponent {
  protected _title = 'Расписание';

  protected _services = [
    { id: 1, name: 'Маникюр' },
    { id: 2, name: 'Педикюр' },
  ];
  protected _masters = [
    { id: 3, name: 'Валерия' },
    { id: 4, name: 'Юлия' },
    { id: 5, name: 'Лилия' },
  ];

  private _statusDirects = [Status.New, Status.Success, Status.Canceled, Status.Pending];
  protected _rangeTime = [15, 75];
  protected _choicePeriod = signal<Date[] | undefined>(undefined);
  protected _showFilters = signal<boolean>(false);

  showFiltersWindow() {
    this._showFilters.set(!this._showFilters());
  }

  protected get status() {
    return this._statusDirects;
  }

  test(period: Date[]) {
    if (period.length === 2) {
      period.forEach((periodElem) => {
        if (periodElem != null) {
          console.log(
            periodElem.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            }),
          );
        }
      });
    }
  }

  protected _choiceServices(value: string) {
    console.log(value);
  }
}
