import { Router } from 'express';

const router = Router();

router.get('/distance', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'fromLat, fromLon, toLat, toLon required' });
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false&annotations=distance,duration`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      return res.json({
        distanceKm: null,
        durationMin: null,
        error: 'Rute tidak ditemukan',
      });
    }

    const route = data.routes[0];
    res.json({
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghitung rute' });
  }
});

export default router;
