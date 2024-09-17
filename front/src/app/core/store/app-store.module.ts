import { NgModule } from '@angular/core';
import {NgxsModule} from '@ngxs/store';
import {ClientsState} from './clients';
import {AuthState} from './auth';



@NgModule({
  declarations: [],
  imports: [
    NgxsModule.forFeature([ClientsState, AuthState])
  ]
})
export class AppStoreModule { }
