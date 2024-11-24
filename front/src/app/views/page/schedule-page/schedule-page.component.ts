import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {MatFormField, MatFormFieldModule, MatHint, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MonthChoice} from '@shared/utils/month-choice';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from '@angular/material/datepicker';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatSlider, MatSliderRangeThumb} from "@angular/material/slider";

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [
    MatFormField,
    MatSelect,
    MatLabel,
    MatHint,
    MatOption,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatFormFieldModule, MatDatepickerModule, MatCheckbox, MatSlider, MatSliderRangeThumb
  ],
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulePageComponent implements OnInit{
  protected _title = 'Расписание';
  protected month = MonthChoice;
  protected _showFilters = signal<boolean>(false);

  showFiltersWindow() {
    this._showFilters.set(!this._showFilters());
  }

  test() {
    console.log(this.month);
  }
  ngOnInit() {
    this.test();
  }


}
