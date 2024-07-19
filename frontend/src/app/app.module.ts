import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MainComponent} from "./views/page/main/main.component";
import {CookieService} from "ngx-cookie-service";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import { HttpClientModule} from "@angular/common/http";
import {SharedModule} from "./shared/shared.module";
import {ClientsComponent} from "./views/page/clients/clients.component";

// import {AuthInterceptor} from "./core/auth/auth.interceptor"

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ClientsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    MatSnackBarModule,
    AppRoutingModule,
    NoopAnimationsModule
  ],
  providers: [
    CookieService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    // {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
