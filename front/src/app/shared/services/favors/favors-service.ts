import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesType } from '@shared/types/services.type';
import { DefaultResponseType } from '@shared/types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavorsService {

  constructor(private readonly _http: HttpClient) { }

  public getAllFavors(): Observable<ServicesType[] | DefaultResponseType> {
    return this._http.get<ServicesType[] | DefaultResponseType>(environment.api + 'services');
  }

  public getFavorsById(id: string): Observable<ServicesType | DefaultResponseType> {
    return this._http.get<ServicesType | DefaultResponseType>(environment.api + 'services' ,{
      params: {id: id}
    });
  }

  public getFavorsByCategory(id: string): Observable<ServicesType[] | DefaultResponseType> {
    return this._http.get<ServicesType[] | DefaultResponseType>(environment.api + 'services' ,{
      params: {categoryId: id}
    });
  }

  public createFavors(body: ServicesType): Observable<ServicesType | DefaultResponseType> {
    return this._http.post<ServicesType | DefaultResponseType>(environment.api + 'services', body);
  }

  public updateFavors(body: ServicesType): Observable<ServicesType | DefaultResponseType> {
    return this._http.put<ServicesType | DefaultResponseType>(environment.api + 'services', body);
  }

  public deleteFavors(id: string): Observable<ServicesType | DefaultResponseType> {
    return this._http.delete<ServicesType | DefaultResponseType>(environment.api + 'services' ,{
      params: {id: id}
    });
  }
}
