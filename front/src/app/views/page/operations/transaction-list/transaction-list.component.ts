import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

enum PeriodValue {
  ALL= 'all',
  WEEK= 'week',
  MONTH= 'month',
  YEAR= 'year',
  TODAY= 'today'
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    SelectButton,
    FormsModule,
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit {
  protected _title = 'Список операций';
  protected _period = '';

  protected _periodFilters = [
    {
      label: 'Сегодня',
      value: PeriodValue.TODAY,
    },
    {
      label: 'За неделю',
      value: PeriodValue.WEEK,
    },
    {
      label: 'За месяц',
      value: PeriodValue.MONTH,
    },
    {
      label: 'За год',
      value: PeriodValue.YEAR,
    },
    {
      label: 'За все время',
      value: PeriodValue.ALL,
    }];

  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  public ngOnInit(): void {
    this._activatedRoute.queryParams.subscribe(params => {
      this._period = params['period'];
    });
  }

  protected _selectedPeriod(period: string) {
    this._router.navigate([], {queryParams: {period}});
  }

}
