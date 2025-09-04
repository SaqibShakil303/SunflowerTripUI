import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ssrApiInterceptor } from './services/interceptor/ssr-api.interceptor';

export const appConfigServer: ApplicationConfig = {
  providers: [
    provideNoopAnimations(),   
     provideHttpClient(withInterceptors([ssrApiInterceptor])),
  ]
};

// export const config = mergeApplicationConfig(appConfig, appConfigServer);
