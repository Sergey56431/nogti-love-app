import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import { ClientType, UserInfoType } from '@shared/types';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }

  public getAllClients(): Observable<ClientType[] | undefined> {
    return this.http.get<ClientType[] | undefined>(environment.api + 'users', {
      params: {
        role: 'CLIENT',
      }
    });
  }

  public getClient(id: string): Observable<UserInfoType | undefined> {
    return this.http.get<UserInfoType | undefined>(environment.api + 'users/?id=' + id);
  }
}
