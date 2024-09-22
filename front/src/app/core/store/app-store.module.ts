import { NgModule } from '@angular/core';
import {NgxsModule} from '@ngxs/store';
import {ClientsState} from './clients';
import {AuthState} from './auth';
import {UserState} from "./users";



@NgModule({
  declarations: [],
  imports: [
    NgxsModule.forFeature([ClientsState, AuthState, UserState])
  ]
})
export class AppStoreModule { }
