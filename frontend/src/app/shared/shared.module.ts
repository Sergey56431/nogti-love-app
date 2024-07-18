import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SidebarComponent} from "./layout/sidebar/sidebar.component";
import { LayoutComponent } from './layout/layout.component';
import {RouterModule} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";




@NgModule({
  declarations: [
    SidebarComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule
  ],
  exports: [
    SidebarComponent,
    LayoutComponent
  ]
})
export class SharedModule { }
