import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Core/Interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
  ],
};
