import { Router } from 'express';

const router = Router();

router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Jakarta`;

    const response = await fetch(url);
    const data = await response.json();

    const weatherCodeMap = {
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

    res.json({
      temperature: data.current?.temperature_2m,
      humidity: data.current?.relative_humidity_2m,
      precipitation: data.current?.precipitation,
      windSpeed: data.current?.wind_speed_10m,
      weatherCode: data.current?.weather_code,
      weatherDescription: weatherCodeMap[data.current?.weather_code] || 'Tidak diketahui',
      tempMax: data.daily?.temperature_2m_max?.[0],
      tempMin: data.daily?.temperature_2m_min?.[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data cuaca' });
  }
});

export default router;
