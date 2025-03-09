import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { createDispatchMap, Store } from '@ngxs/store';
import { SettingsActions, SettingsState } from '@core/store';
import { UserInfoType } from '@shared/types';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent implements OnInit{
  protected readonly _title = 'Настройки';
  private _userInfo = signal<UserInfoType>({} as UserInfoType);

  private readonly _store = inject(Store);
  private readonly _authService = inject(AuthService);
  private readonly _settings = this._store.selectSignal(SettingsState.getSettings);

  private _actions = createDispatchMap({
    getSettings: SettingsActions.GetSettings,
  });

  public ngOnInit(): void {
    this._userInfo.set(this._authService.getUserInfo());
    this._actions.getSettings(this._userInfo().userId ?? '');
    console.log(this._settings());
  }

}
