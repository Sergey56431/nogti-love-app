import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { CalendarResponse, DefaultResponseType } from '@shared/types';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private http: HttpClient) {
  }

  public fetchAllDays(): Observable<CalendarResponse[] | DefaultResponseType> {
    return this.http.get<CalendarResponse[] | DefaultResponseType>(environment.api + 'calendar');
  }

  public fetchCalendarByUser(userid: string): Observable<CalendarResponse[] | DefaultResponseType> {
    return this.http.get<CalendarResponse[] | DefaultResponseType>(environment.api + 'calendar', {
      params: {
        userId: userid
      }
    });
  }

  public fetchCalendarByDate(dateId: string): Observable<CalendarResponse | DefaultResponseType> {
    return this.http.get<CalendarResponse | DefaultResponseType>(environment.api + 'calendar', {
      params: {
        id: dateId
      }
    });
  }

  public createDate(data: any):Observable<any> {
    return this.http.post<CalendarResponse | DefaultResponseType>(environment.api + 'calendar', data);
  }

  public createSchedule(data: any):Observable<any> {
    return this.http.post<CalendarResponse | DefaultResponseType>(environment.api + 'calendar', data);
  }

  public updateDate(data: any, id: string):Observable<any> {
    return this.http.put<CalendarResponse | DefaultResponseType>(environment.api + 'calendar', {
      params: {
        id: id,
      },
      body: data
    });
  }

  public deleteDate(id: string):Observable<any> {
    return this.http.delete<CalendarResponse | DefaultResponseType>(environment.api + 'calendar', {
      params: {
        id: id,
      }
    });
  }
}
