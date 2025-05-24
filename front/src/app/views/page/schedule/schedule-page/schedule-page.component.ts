import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Slider } from 'primeng/slider';
import { Status } from '@shared/utils';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { createDispatchMap, select, Store } from '@ngxs/store';
import { CalendarActions, CalendarState } from '@core/store';
import { CalendarResponse } from '@shared/types';

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
    ButtonModule,
  ],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePageComponent {
  private _store = inject(Store);
  protected _title = 'Расписание';

  protected _directs: CalendarResponse[] = [];
  protected _intervalCalendarData = select(CalendarState.getCalendar);
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
  protected _choicePeriod = signal<string[]>([]);

  protected _showFilters = signal<boolean>(false);

  showFiltersWindow() {
    this._showFilters.set(!this._showFilters());
  }

  private _actions = createDispatchMap({
    selectPeriodCalendar: CalendarActions.FetchInterval
  });

  protected get status() {
    return this._statusDirects;
  }

  protected _selectPeriod(period: Date[]) {
    this._choicePeriod.set([]);
    if (period.length === 2 && period[1] != null) {
      period.forEach((periodElem) => {
        if (periodElem != null) {

          const date = periodElem.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .split('.')
            .reverse()
            .join('-');
          this._choicePeriod()?.push(date);
        }

        if (this._choicePeriod()?.length > 1)  {
          this._actions?.selectPeriodCalendar(this._choicePeriod());
          console.log(this._choicePeriod());
        }
      });

    }
  }

  protected _choiceServices(value: string) {
    console.error(value);
  }
}
