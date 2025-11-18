import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Rutas
    provideRouter(routes),

    // HTTP Client
    provideHttpClient(),

    // ng-bootstrap
    importProvidersFrom(NgbModule),

    // Configuración de reCAPTCHA
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key - REEMPLAZAR en producción
      } as RecaptchaSettings,
    },
  ],
}).catch((err) => console.error(err));
