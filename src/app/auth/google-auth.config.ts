import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environments.dev';

export const googleAuthConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  redirectUri: window.location.origin + '/sign-in-with/google/oauth2',
  clientId: environment.googleClientId,
  scope: 'openid profile email',
  requireHttps: false,
  customQueryParams: {
    prompt: 'select_account',
  },
  showDebugInformation: true,
};