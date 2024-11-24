import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CalendarResponse} from '@shared/types';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private http: HttpClient) {
  }

  public getDirects(id: string): Observable<CalendarResponse> {
    return this.http.get<CalendarResponse>(environment.api + 'calendar/' + id);
  }
}
