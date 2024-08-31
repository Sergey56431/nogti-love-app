import {ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient} from '@angular/common/http';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {provideStore} from '@ngxs/store';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {

  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore(),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    {
        provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
        useValue: { duration: 2500 },
    }, provideCharts(withDefaultRegisterables()), provideStore([]), provideServiceWorker('ngsw-worker.js', {
        enabled: isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })]
};
