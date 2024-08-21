import { NgModule } from '@angular/core';
import {NgxsModule} from "@ngxs/store";
import {ClientsState} from "./clients";



@NgModule({
  declarations: [],
  imports: [
    NgxsModule.forFeature([ClientsState])
  ]
})
export class AppStoreModule { }
