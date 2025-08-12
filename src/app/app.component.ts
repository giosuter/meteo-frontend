// src/app/app.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WeatherService,
  CurrentWeatherDto,
  ForecastDto,
} from './services/weather.service';
import { mapIcon } from './icon-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Meteo';

  city = 'Zurich';
  country = ''; // ISO-2 optional

  loading = signal(false);
  error = signal<string | null>(null);

  current: CurrentWeatherDto | null = null;
  forecast: ForecastDto | null = null;

  constructor(private weather: WeatherService) {}

  ngOnInit(): void {
    const qp = new URLSearchParams(location.search);
    const c = qp.get('city');
    const cc = qp.get('country');
    if (c?.trim()) this.city = c.trim();
    if (cc?.trim()) this.country = cc.trim().toUpperCase();

    this.refreshAll();
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

  // Build path to your local SVG icons
  getIconPath(code: string): string {
    // Put your SVGs under: src/assets/weather-icons/*.svg
    return `assets/weather-icons/${mapIcon(code)}.svg`;
  }

  private updateUrl(city: string, country: string) {
    const qp = new URLSearchParams();
    qp.set('city', city.trim());
    if (country?.trim()) qp.set('country', country.trim().toUpperCase());
    history.replaceState(null, '', `${location.pathname}?${qp.toString()}${location.hash}`);
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
}