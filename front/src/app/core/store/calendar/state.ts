import { CalendarResponse, DefaultResponseType } from '@shared/types';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CalendarActions } from '@core/store';
import { CalendarService } from '@shared/services';

interface CalendarStateModel {
  calendar?: CalendarResponse[];
}

@State<CalendarStateModel>({
  name: 'calendar',
  defaults: {
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
    if (state.calendar != null) {
      return state?.calendar;
    }

    this._calendarService?.fetchIntervalCalendar(action.interval).subscribe(calendare => {
      if ((calendare as DefaultResponseType)?.error == null) {
        ctx.patchState({
          calendar: calendare as CalendarResponse[],
        });
      }
    });

    return state?.calendar;
  }
}
