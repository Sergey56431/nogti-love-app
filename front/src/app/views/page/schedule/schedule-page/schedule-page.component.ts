import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Slider } from 'primeng/slider';
import { Status } from '@shared/utils';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { createDispatchMap, select } from '@ngxs/store';
import { CalendarActions, CalendarState } from '@core/store';
import { DirectItem, FiltersComponent } from '@shared/components';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule-page',
  imports: [
    DatePicker,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    FiltersComponent,
    DatePipe,
    DirectItem,
  ],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePageComponent implements OnInit {
  protected _title = 'Расписание';

  protected _intervalCalendarData = select(CalendarState.getCalendar);
  protected _calendarData = computed(() => {
    return this._intervalCalendarData();
  });

  private _statusDirects = [Status.New, Status.Success, Status.Canceled, Status.Pending];
  protected _choicePeriod = signal<string[]>([]);

  protected _showFilters = signal<boolean>(false);

  protected _showFiltersWindow() {
    this._showFilters.set(!this._showFilters());
  }

  private _actions = createDispatchMap({
    selectPeriodCalendar: CalendarActions.FetchInterval,
  });

  protected get status() {
    return this._statusDirects;
  }

  public ngOnInit(): void {
    this._initSchedule();
  }

  private _initSchedule(){
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);
    this._selectPeriod([startDate, endDate]);
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

        if (this._choicePeriod()?.length > 1) {
          this._actions?.selectPeriodCalendar(this._choicePeriod());
          console.log(this._calendarData());
        }
      });

    }
  }
}
