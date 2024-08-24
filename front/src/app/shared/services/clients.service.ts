import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }

  getAllClients(): Observable<ClientTypes[] | undefined> {
    return this.http.get<ClientTypes[] | undefined>(environment.api + 'clients');
  }
}
