import { CalendarResponse, DefaultResponseType } from '@shared/types';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CalendarService } from '@shared/services';
import { CalendarActions } from '@core/store';

interface CalendarStateModel {
  period: string[]
  calendar: CalendarResponse[];
}

@State<CalendarStateModel>({
  name: 'calendar',
  defaults: {
    period: [],
    calendar: [],
  },
})

@Injectable()
export class CalendarState {
  constructor(private _calendarService?: CalendarService) {
  }

  @Selector()
  static getCalendar(state: CalendarStateModel) {
    return state?.calendar;
  }

  @Action(CalendarActions.FetchInterval)
  private _fetchInterval(ctx: StateContext<CalendarStateModel>, action: CalendarActions.FetchInterval) {
    const state = ctx.getState();
    if (state?.period[0] === action.interval[0] && state?.period[1] === action.interval[1]) {
      console.log('returning', state?.calendar);
      return state?.calendar;
    }

    this._calendarService?.fetchIntervalCalendar(action.interval).subscribe(calendare => {
      if ((calendare as DefaultResponseType)?.error == null) {
        ctx.patchState({
          period: action.interval,
          calendar: calendare as CalendarResponse[],
        });
      }
    });

    return state?.calendar;
  }
}
