import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
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

  getCurrent(city: string, country?: string): Observable<CurrentWeatherDto> {
    let params = new HttpParams().set('city', city);
    if (country) params = params.set('country', country);
    return this.http
      .get<CurrentWeatherDto>(`${this.base}/api/weather/current`, { params })
      .pipe(catchError(this.handleHttpError));
  }

  getForecast(city: string, country?: string): Observable<ForecastDto> {
    let params = new HttpParams().set('city', city);
    if (country) params = params.set('country', country);
    return this.http
      .get<ForecastDto>(`${this.base}/api/weather/forecast`, { params })
      .pipe(catchError(this.handleHttpError));
  }

  private handleHttpError(err: HttpErrorResponse) {
    const msg = err.error?.message || err.statusText || 'Network error';
    return throwError(() => new Error(`Weather API error: ${msg} (HTTP ${err.status})`));
  }
}