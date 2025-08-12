// src/app/app.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  WeatherService,
  CurrentWeatherDto,
  ForecastDto,
} from './services/weather.service';

// i18n
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// icon mapping
import { mapIcon } from './icon-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Meteo';

  city = 'Wohlen';
  country = ''; // ISO-2 optional

  selectedLang = 'de'; // bound to the <select>

  loading = signal(false);
  error = signal<string | null>(null);

  current: CurrentWeatherDto | null = null;
  forecast: ForecastDto | null = null;

  private readonly supported = ['en', 'de', 'fr', 'it', 'hu'] as const;

  constructor(
    private weather: WeatherService,
    private translate: TranslateService
  ) {
    // Configure languages
    this.translate.addLangs(this.supported as unknown as string[]);
    this.translate.setDefaultLang('de');

    // Prefer order: URL -> localStorage -> 'de'
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('lang');
    const stored = (typeof localStorage !== 'undefined')
      ? localStorage.getItem('lang')
      : null;

    const initial = this.normalizeLang(fromUrl || stored || 'de');
    this.selectedLang = initial; // so the selector matches
    this.translate.use(initial);
  }

  ngOnInit(): void {
    const qp = new URLSearchParams(location.search);
    const c = qp.get('city');
    const cc = qp.get('country');
    if (c?.trim()) this.city = c.trim();
    if (cc?.trim()) this.country = cc.trim().toUpperCase();

    this.refreshAll();
  }

  // === i18n handler for the <select> ===
  changeLang(lang: string): void {
    const norm = this.normalizeLang(lang);
    if (this.supported.includes(norm as any)) {
      this.selectedLang = norm;
      this.translate.use(norm);

      // persist choice
      try { localStorage.setItem('lang', norm); } catch {}

      // keep lang in URL alongside city/country
      const params = new URLSearchParams(location.search);
      params.set('lang', norm);
      if (this.city?.trim()) params.set('city', this.city.trim());
      if (this.country?.trim())
        params.set('country', this.country.trim().toUpperCase());
      history.replaceState(
        null,
        '',
        `${location.pathname}?${params.toString()}${location.hash}`
      );
    }
  }

  refreshAll(): void {
    this.error.set(null);
    this.loading.set(true);

    const city = this.city.trim();
    const iso2 = (this.country || '').trim().toUpperCase() || undefined;

    this.weather.getCurrent(city, iso2).subscribe({
      next: (cw) => {
        this.current = cw;

        this.weather.getForecast(city, iso2).subscribe({
          next: (fc) => {
            this.forecast = fc;
            this.loading.set(false);
            this.updateUrl(city, this.country);
          },
          error: (e) => this.fail(e),
        });
      },
      error: (e) => this.fail(e),
    });
  }

  getIconPath(code: string): string {
    return `assets/weather-icons/${mapIcon(code)}.svg`;
  }

  private updateUrl(city: string, country: string) {
    const qp = new URLSearchParams(location.search);
    qp.set('city', city.trim());
    if (country?.trim()) qp.set('country', country.trim().toUpperCase());

    // keep current lang in URL too (default to 'de')
    const lang = this.normalizeLang(this.translate.currentLang || 'de');
    qp.set('lang', lang);

    history.replaceState(
      null,
      '',
      `${location.pathname}?${qp.toString()}${location.hash}`
    );
  }

  private fail(e: unknown) {
    this.error.set(e instanceof Error ? e.message : String(e));
    this.loading.set(false);
  }

  toLocalTime(epochSec: number): string {
    return epochSec
      ? new Date(epochSec * 1000).toLocaleTimeString('de-CH', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  /** Normalize anything like "de-CH", "it_IT" -> "de", "it"; fallback to 'de' */
  private normalizeLang(lang: string): string {
    const two = (lang || 'de').toLowerCase().slice(0, 2);
    return this.supported.includes(two as any) ? two : 'de';
  }
}