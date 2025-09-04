// main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
// import { appConfigServer } from './app/app.config.server';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { ssrApiInterceptor } from './app/services/interceptor/ssr-api.interceptor';
import { appConfigServer } from './app/app.config.server';


// const serverConfig = {
//   ...appConfig,
//   providers: [
//     ...(appConfig.providers || []),
//     provideHttpClient(withInterceptors([ssrApiInterceptor])),
//   ],
// };

const bootstrap = () => bootstrapApplication(AppComponent, appConfigServer);
export default bootstrap;
