import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectsType, DirectsClientType, DefaultResponseType } from '@shared/types';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectsService {

  constructor(private readonly _http: HttpClient) { }

  public fetchAllDirects(): Observable<DirectsClientType[] | DefaultResponseType> {
    return this._http.get<DirectsClientType[] | DefaultResponseType>(environment.api + 'directs');
  }

  public fetchDirectsByDate(date: string): Observable<DirectsClientType[] | DefaultResponseType> {
    return this._http.get<DirectsClientType[] | DefaultResponseType>(environment.api + 'directs', {
      params: {
        date: date
      }
    });
  }

  public fetchDirectsByDateUser(date: string, userId: string): Observable<DirectsClientType[] | DefaultResponseType> {
    return this._http.get<DirectsClientType[] | DefaultResponseType>(environment.api + 'directs', {
      params: {
        date: date,
        userId: userId
      }
    });
  }

  public fetchDirectsByUser(userId: string): Observable<DirectsClientType[] | DefaultResponseType> {
    return this._http.get<DirectsClientType[] | DefaultResponseType>(environment.api + 'directs', {
      params: {
        userId: userId
      }
    });
  }

  public fetchDirectById(directId: string): Observable<DirectsClientType | DefaultResponseType> {
    return this._http.get<DirectsClientType | DefaultResponseType>(environment.api + 'directs',{
      params: {
        id: directId
      }
    });
  }

  public createDirect(direct: DirectsType): Observable<DirectsClientType | DefaultResponseType> {
    return this._http.post<DirectsClientType | DefaultResponseType>(environment.api + 'directs', direct);
  }

  public updateDirect(direct: DirectsType, directId: string): Observable<DirectsClientType | DefaultResponseType> {
    return this._http.put<DirectsClientType | DefaultResponseType>(environment.api + 'directs', {
      params: { id: directId },
      body: direct
    });
  }

  public deleteDirect(directId: string): Observable<DirectsClientType | DefaultResponseType> {
    return this._http.delete<DirectsClientType | DefaultResponseType>(environment.api + 'directs', {
      params: {id: directId}
    });
  }
}
