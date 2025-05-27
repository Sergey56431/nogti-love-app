import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { createDispatchMap, select } from '@ngxs/store';
import { SettingsActions, SettingsState } from '@core/store';
import { UserInfoType } from '@shared/types';
import { AuthService } from '@core/auth';
import { InputText } from 'primeng/inputtext';
import { SettingsType } from '@shared/types/settings.type';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    InputText,
    Button,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent implements OnInit {
  protected readonly _title = 'Настройки';
  private _userInfo = signal<UserInfoType>({} as UserInfoType);
  protected _canSend = signal<boolean>(false);
  protected _defaultSettings = computed(() => {
    return this._settings();
  });
  protected _newSettings = signal<Partial<SettingsType>>({} as Partial<SettingsType>);

  private readonly _authService = inject(AuthService);
  protected readonly _settings = select(SettingsState.getSettings);

  private _actions = createDispatchMap({
    getSettings: SettingsActions.GetSettings,
    saveSettings: SettingsActions.UpdateSettings,
  });

  public ngOnInit(): void {
    this._userInfo.set(this._authService.getUserInfo());
    this._actions.getSettings(this._userInfo().userId ?? '');
  }

  protected changeSettings(setting: string, props: string) {
    Object.assign(this._newSettings(), {
      [props]: setting,
    });
    if (this._settings()?.[props as keyof SettingsType] === this._newSettings()?.[props as keyof SettingsType]) {
      delete this._newSettings()?.[props as keyof SettingsType];
    }
    if (Object.keys(this._newSettings()).length > 0) {
      this._canSend.set(true);
    } else {
      this._canSend.set(false);
    }
  }

  protected _saveSettings(): void {
    this._actions.saveSettings(this._userInfo().userId ?? '', this._newSettings());
    this._canSend.set(false);
  }

  protected _removeSettings(): void {
    this._newSettings.set({});
    this._canSend.set(false);
    this._actions.getSettings(this._userInfo().userId ?? '');
  }
}
