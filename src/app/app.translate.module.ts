// src/app/app.translate.module.ts
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// IMPORTANT: this must return a clean loader with the correct assets path
export function HttpLoaderFactory(http: HttpClient) {
  // Looks under: /assets/i18n/<lang>.json
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    HttpClientModule, // required for HTTP loading of JSON files
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      // (optional) default language could also be set at runtime in the component
      // defaultLanguage: 'en',
    }),
  ],
  exports: [TranslateModule],
})
export class AppTranslateModule {}