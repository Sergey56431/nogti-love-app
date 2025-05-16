import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SettingsState } from './settings';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { OperationsState } from './operations';
import { OperationCategoriesState } from './operations-category';

@NgModule({
  declarations: [],
  imports: [
  NgxsModule.forRoot([SettingsState, OperationsState, OperationCategoriesState]),
  NgxsLoggerPluginModule.forRoot(),
  NgxsReduxDevtoolsPluginModule.forRoot()
  ],
})

export class AppStoreModule {}
