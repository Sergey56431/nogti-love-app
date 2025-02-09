import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInfoType } from '@shared/types';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  public userInfo(userId: string): Observable<UserInfoType> {
    return this.http.get<UserInfoType>(environment.api + 'users/' + userId);
  }
}
