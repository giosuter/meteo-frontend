// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppComponent } from './app/app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

function assetsTranslateLoader(http: HttpClient): TranslateLoader {
  const doc = inject(DOCUMENT);
  const base = doc.querySelector('base')?.getAttribute('href') || '/'; // e.g. "/meteo/"
  return {
    getTranslation(lang: string): Observable<any> {
      const two = (lang || 'en').toLowerCase().slice(0, 2); // "de-CH" -> "de"
      return http.get(`${base}assets/i18n/${two}.json`);
    }
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: assetsTranslateLoader,
          deps: [HttpClient],
        },
      })
    ),
  ],
}).catch((err) => console.error(err));