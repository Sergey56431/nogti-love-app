import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SettingsState } from './settings';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
  declarations: [],
  imports: [
  NgxsModule.forRoot([SettingsState]),
  NgxsLoggerPluginModule.forRoot(),
  NgxsReduxDevtoolsPluginModule.forRoot()
  ],
})

export class AppStoreModule {}
