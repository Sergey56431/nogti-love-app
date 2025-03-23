import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClientInfoType, ClientType, DefaultResponseType, UserInfoType } from '@shared/types';
import { Roles } from '@shared/utils';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {

  constructor(private http: HttpClient) {
  }

  public getAllClients(): Observable<ClientType[] | undefined> {
    return this.http.get<ClientType[] | undefined>(environment.api + 'users', {
      params: {
        role: Roles.CLIENT,
      },
    });
  }

  public getClient(id: string): Observable<UserInfoType | undefined> {
    return this.http.get<UserInfoType | undefined>(environment.api + 'users?id=' + id);
  }

  public updateClient(userId: string, data: Partial<UserInfoType>): Observable<UserInfoType | undefined> {
    return this.http.put<UserInfoType | undefined>(environment.api + 'users', { user: data }, {
      params: {
        id: userId,
      },
    });
  }

  public createClient(data: UserInfoType): Observable<UserInfoType | undefined> {
    return this.http.post<UserInfoType | undefined>(environment.api + 'users', { user: data });
  }

  public deleteClient(id: string): Observable<UserInfoType | undefined> {
    return this.http.delete<UserInfoType | undefined>(environment.api + 'users', {
      params: {
        id: id,
      },
    });
  }

  public fetchAdminClients(masterId: string): Observable<ClientInfoType[] | DefaultResponseType> {
    return this.http.get<ClientType[] | DefaultResponseType>(environment.api + 'clients', {
      params: {
        masterId: masterId,
      },
    });
  }

  public fetchAdminClient(clientId: string): Observable<ClientInfoType | DefaultResponseType> {
    return this.http.get<ClientType | DefaultResponseType>(environment.api + 'clients', {
      params: {
        id: clientId,
      },
    });
  }

  public createNewClient(data: ClientInfoType): Observable<ClientInfoType> {
    return this.http.post<ClientInfoType>(environment.api + 'clients', data);
  }

  public updateClientData(id: string, data: Partial<ClientInfoType>): Observable<ClientInfoType> {
    return this.http.put<ClientInfoType>(environment.api + 'clients', { data: data }, {
      params: {
        id: id,
      },
    });
  }

  public deleteClientById(id: string): Observable<ClientType | DefaultResponseType> {
    return this.http.delete<ClientType | DefaultResponseType>(environment.api + 'clients', {
      params: {
        id: id,
      },
    });
  }
}
