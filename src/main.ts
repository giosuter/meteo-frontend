// src/main.ts
import { bootstrapApplication, importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppTranslateModule } from './app/app.translate.module';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppTranslateModule),
  ],
}).catch(err => console.error(err));