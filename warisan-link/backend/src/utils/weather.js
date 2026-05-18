const WEATHER_CODE_MAP = {
  0: 'Cerah',
  1: 'Cerah Berawan',
  2: 'Berawan',
  3: 'Mendung',
  45: 'Kabut',
  48: 'Kabut Tebal',
  51: 'Gerimis Ringan',
  53: 'Gerimis',
  55: 'Gerimis Lebat',
  61: 'Hujan Ringan',
  63: 'Hujan',
  65: 'Hujan Lebat',
  80: 'Hujan Sebentar',
  95: 'Badai Petir',
  96: 'Badai Petir + Hujan Es',
  99: 'Badai Petir + Hujan Es Lebat',
};

export async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const code = data.current?.weather_code;

    return {
      temperature: data.current?.temperature_2m,
      humidity: data.current?.relative_humidity_2m,
      precipitation: data.current?.precipitation,
      windSpeed: data.current?.wind_speed_10m,
      weatherCode: code,
      weatherDescription: WEATHER_CODE_MAP[code] || 'Tidak diketahui',
      tempMax: data.daily?.temperature_2m_max?.[0],
      tempMin: data.daily?.temperature_2m_min?.[0],
    };
  } catch {
    return null;
  }
}

export async function enrichPlacesWithWeather(places, limit = 10) {
  const toEnrich = places.slice(0, limit);
  const weatherPromises = toEnrich.map((place) => {
    if (place.lat && place.lon) {
      return fetchWeather(place.lat, place.lon);
    }
    return Promise.resolve(null);
  });

  const results = await Promise.allSettled(weatherPromises);

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      places[i].weather = result.value;
    }
  });

  return places;
}
