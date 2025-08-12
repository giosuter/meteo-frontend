// src/app/icon-map.ts
// Map OpenWeather icon codes (01d, 10n, …) to local SVG filenames
export function mapIcon(code: string | null | undefined): string {
  const c = (code || '').toLowerCase();

  // clear
  if (c === '01d') return 'sun';
  if (c === '01n') return 'moon';

  // few / scattered clouds
  if (c === '02d' || c === '03d') return 'partly-cloudy-day';
  if (c === '02n' || c === '03n') return 'partly-cloudy-night';

  // broken/overcast
  if (c.startsWith('04')) return 'cloud';

  // drizzle / rain
  if (c.startsWith('09') || c.startsWith('10')) return 'rain';

  // thunderstorm
  if (c.startsWith('11')) return 'thunder';

  // snow
  if (c.startsWith('13')) return 'snow';

  // mist / fog / haze / dust etc.
  if (c.startsWith('50')) return 'fog';

  // fallback
  return 'cloud';
}