import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectsType } from '@shared/types/directs.type';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectsService {

  constructor(private readonly _http: HttpClient) { }

  public fetchAllDirects(): Observable<any> {
    return this._http.get(environment.api + 'directs');
  }

  public fetchDirectsByDate(date: string): Observable<any> {
    return this._http.get(environment.api + 'directs', {
      params: {
        date: date
      }
    });
  }

  public fetchDirectsByUser(userId: string): Observable<any> {
    return this._http.get(environment.api + 'directs', {
      params: {
        userId: userId
      }
    });
  }

  public fetchDirectById(directId: string): Observable<any> {
    return this._http.get(environment.api + 'directs',{
      params: {
        id: directId
      }
    });
  }

  public createDirect(direct: DirectsType): Observable<any> {
    return this._http.post(environment.api + 'directs', direct);
  }

  public updateDirect(direct: DirectsType, directId: string): Observable<any> {
    return this._http.put(environment.api + 'directs', {
      params: { id: directId },
      body: direct
    });
  }

  public deleteDirect(directId: string): Observable<any> {
    return this._http.delete(environment.api + 'directs', {
      params: {id: directId}
    });
  }
}
