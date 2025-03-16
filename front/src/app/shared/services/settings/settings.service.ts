import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsType } from '@shared/types/settings.type';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private readonly _http: HttpClient) {}

  public getSettings(id: string): Observable<SettingsType> {
    return this._http.get<SettingsType>(environment.api + 'settings?userId=' + id);
  }

  public updateSettings(userId: string, body: Partial<SettingsType>): Observable<SettingsType> {
    return this._http.put<SettingsType>(environment.api + 'settings?userId=' + userId, body);
  }
}
