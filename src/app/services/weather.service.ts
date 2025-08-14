import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentWeatherDto {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windKph: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

export interface ForecastDayDto {
  date: string;
  min: number;
  max: number;
  description: string;
  icon: string;
  pop: number;
}

export interface ForecastDto {
  city: string;
  country: string;
  days: ForecastDayDto[];
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly base = environment.apiBase;

  constructor(private http: HttpClient) {}

  /**
   * Get the current weather. Optionally pass a language code for localization.
   */
  getCurrent(city: string, country?: string, lang?: string): Observable<CurrentWeatherDto> {
    const { params, headers } = this.buildOptions(city, country, lang);
    return this.http
      .get<CurrentWeatherDto>(`${this.base}/api/weather/current`, { params, headers })
      .pipe(catchError(this.handleHttpError));
  }

  /**
   * Get the forecast. Optionally pass a language code for localization.
   */
  getForecast(city: string, country?: string, lang?: string): Observable<ForecastDto> {
    const { params, headers } = this.buildOptions(city, country, lang);
    return this.http
      .get<ForecastDto>(`${this.base}/api/weather/forecast`, { params, headers })
      .pipe(catchError(this.handleHttpError));
  }

  /**
   * Build HttpParams and optional headers for all requests.
   */
  private buildOptions(city: string, country?: string, lang?: string): { params: HttpParams; headers?: HttpHeaders } {
    let params = new HttpParams().set('city', city);
    if (country) params = params.set('country', country);

    let headers: HttpHeaders | undefined;
    const normLang = (lang || '').trim().toLowerCase();
    if (normLang) {
      params = params.set('lang', normLang);
      headers = new HttpHeaders({ 'Accept-Language': normLang });
    }

    return { params, headers };
  }

  private handleHttpError(err: HttpErrorResponse) {
    const msg = err.error?.message || err.statusText || 'Network error';
    return throwError(() => new Error(`Weather API error: ${msg} (HTTP ${err.status})`));
  }
}