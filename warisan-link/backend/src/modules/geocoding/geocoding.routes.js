import { Router } from 'express';

const router = Router();

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=id`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'WarisanLink/1.0' },
    });
    const data = await response.json();

    res.json({
      displayName: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.county,
      state: data.address?.state,
      country: data.address?.country,
      country_code: data.address?.country_code,
      postcode: data.address?.postcode,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data geocoding' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'q (query) required' });
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=5&accept-language=id`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'WarisanLink/1.0' },
    });
    const data = await response.json();

    res.json(
      data.map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        importance: item.importance,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari lokasi' });
  }
});

export default router;
