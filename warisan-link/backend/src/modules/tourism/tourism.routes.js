import express from 'express';
import { enrichPlacesWithWeather } from '../../utils/weather.js';

const router = express.Router();

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

const COUNTRIES = {
  ID: {
    name: 'Indonesia',
    bounds: { south: -11.0, west: 95.0, north: 6.0, east: 141.0 },
    provinces: {
      'Aceh': { south: 2.0, west: 95.0, north: 5.8, east: 98.3 },
      'Sumatera Utara': { south: 0.5, west: 98.0, north: 4.2, east: 100.5 },
      'Sumatera Barat': { south: -3.3, west: 98.8, north: 0.8, east: 101.8 },
      'Riau': { south: -1.5, west: 100.0, north: 2.5, east: 104.5 },
      'Kepulauan Riau': { south: -0.5, west: 103.3, north: 1.8, east: 109.0 },
      'Jambi': { south: -2.8, west: 101.0, north: -0.8, east: 104.5 },
      'Sumatera Selatan': { south: -4.5, west: 102.0, north: -1.5, east: 106.0 },
      'Bengkulu': { south: -5.5, west: 100.8, north: -2.5, east: 103.0 },
      'Lampung': { south: -6.2, west: 103.5, north: -3.7, east: 106.0 },
      'DKI Jakarta': { south: -6.4, west: 106.5, north: -6.0, east: 107.0 },
      'Jawa Barat': { south: -7.8, west: 106.3, north: -5.9, east: 108.8 },
      'Jawa Tengah': { south: -8.2, west: 108.5, north: -5.7, east: 111.7 },
      'DI Yogyakarta': { south: -8.2, west: 110.0, north: -7.5, east: 110.9 },
      'Jawa Timur': { south: -8.8, west: 110.7, north: -5.0, east: 116.2 },
      'Banten': { south: -7.2, west: 105.0, north: -5.8, east: 106.8 },
      'Bali': { south: -8.9, west: 114.4, north: -8.0, east: 115.7 },
      'Nusa Tenggara Barat': { south: -9.2, west: 115.8, north: -8.0, east: 119.4 },
      'Nusa Tenggara Timur': { south: -11.0, west: 118.5, north: -7.9, east: 125.3 },
      'Kalimantan Barat': { south: -3.5, west: 108.5, north: 2.5, east: 114.5 },
      'Kalimantan Tengah': { south: -3.8, west: 110.8, north: 0.5, east: 116.0 },
      'Kalimantan Selatan': { south: -5.0, west: 114.2, north: -1.0, east: 116.5 },
      'Kalimantan Timur': { south: -2.5, west: 114.3, north: 2.5, east: 119.0 },
      'Kalimantan Utara': { south: 1.0, west: 114.5, north: 4.3, east: 118.0 },
      'Sulawesi Utara': { south: 0.3, west: 123.0, north: 5.0, east: 127.0 },
      'Sulawesi Tengah': { south: -3.5, west: 119.5, north: 1.5, east: 124.0 },
      'Sulawesi Selatan': { south: -7.8, west: 118.8, north: -1.8, east: 122.0 },
      'Sulawesi Tenggara': { south: -6.5, west: 120.8, north: -3.5, east: 124.0 },
      'Gorontalo': { south: 0.3, west: 121.0, north: 1.2, east: 123.5 },
      'Sulawesi Barat': { south: -3.8, west: 118.8, north: -1.5, east: 119.8 },
      'Maluku': { south: -8.5, west: 126.0, north: -2.8, east: 131.5 },
      'Maluku Utara': { south: -2.5, west: 124.0, north: 2.8, east: 129.5 },
      'Papua': { south: -9.0, west: 134.0, north: -0.5, east: 141.0 },
      'Papua Barat': { south: -5.0, west: 129.0, north: 1.0, east: 135.0 },
    },
  },
  MY: {
    name: 'Malaysia',
    bounds: { south: 0.8, west: 99.5, north: 7.5, east: 120.0 },
    provinces: {
      'Johor': { south: 1.2, west: 102.5, north: 2.7, east: 104.5 },
      'Melaka': { south: 2.1, west: 101.9, north: 2.5, east: 102.4 },
      'Negeri Sembilan': { south: 2.3, west: 101.6, north: 3.1, east: 102.5 },
      'Selangor': { south: 2.5, west: 101.0, north: 3.8, east: 102.0 },
      'Kuala Lumpur': { south: 3.0, west: 101.5, north: 3.3, east: 101.8 },
      'Putrajaya': { south: 2.9, west: 101.6, north: 3.0, east: 101.8 },
      'Perak': { south: 3.7, west: 100.5, north: 5.8, east: 102.0 },
      'Penang': { south: 5.1, west: 100.2, north: 5.5, east: 100.6 },
      'Kedah': { south: 5.3, west: 100.0, north: 6.7, east: 101.0 },
      'Perlis': { south: 6.3, west: 100.0, north: 6.7, east: 100.5 },
      'Kelantan': { south: 4.5, west: 101.5, north: 6.3, east: 103.0 },
      'Terengganu': { south: 4.0, west: 102.3, north: 5.8, east: 103.5 },
      'Pahang': { south: 2.6, west: 101.5, north: 4.6, east: 103.5 },
      'Sabah': { south: 4.0, west: 115.0, north: 7.0, east: 119.5 },
      'Sarawak': { south: 0.8, west: 109.5, north: 5.0, east: 115.0 },
      'Labuan': { south: 5.2, west: 115.1, north: 5.4, east: 115.4 },
    },
  },
  SG: {
    name: 'Singapore',
    bounds: { south: 1.15, west: 103.6, north: 1.47, east: 104.1 },
    provinces: {
      'Central Region': { south: 1.26, west: 103.8, north: 1.37, east: 103.9 },
      'East Region': { south: 1.30, west: 103.9, north: 1.37, east: 104.0 },
      'North Region': { south: 1.37, west: 103.7, north: 1.47, east: 103.9 },
      'North-East Region': { south: 1.33, west: 103.8, north: 1.42, east: 103.9 },
      'West Region': { south: 1.28, west: 103.6, north: 1.37, east: 103.8 },
    },
  },
  TH: {
    name: 'Thailand',
    bounds: { south: 5.6, west: 97.3, north: 20.5, east: 105.6 },
    provinces: {
      'Bangkok': { south: 13.5, west: 100.3, north: 14.0, east: 100.9 },
      'Chiang Mai': { south: 17.8, west: 98.5, north: 20.0, east: 99.5 },
      'Chiang Rai': { south: 19.5, west: 99.5, north: 20.5, east: 100.5 },
      'Phuket': { south: 7.8, west: 98.2, north: 8.2, east: 98.5 },
      'Krabi': { south: 7.8, west: 98.8, north: 8.5, east: 99.3 },
      'Surat Thani': { south: 8.2, west: 98.8, north: 10.0, east: 100.0 },
      'Ayutthaya': { south: 14.1, west: 100.3, north: 14.5, east: 100.7 },
      'Pattaya': { south: 12.8, west: 100.8, north: 13.0, east: 101.0 },
    },
  },
  PH: {
    name: 'Philippines',
    bounds: { south: 4.5, west: 116.0, north: 21.0, east: 127.0 },
    provinces: {
      'Metro Manila': { south: 14.3, west: 120.8, north: 14.8, east: 121.2 },
      'Cebu': { south: 9.5, west: 123.0, north: 11.0, east: 124.0 },
      'Bohol': { south: 9.5, west: 123.8, north: 10.1, east: 124.5 },
      'Palawan': { south: 8.5, west: 117.5, north: 12.0, east: 120.0 },
      'Boracay': { south: 11.9, west: 121.9, north: 12.0, east: 122.0 },
      'Baguio': { south: 16.3, west: 120.5, north: 16.5, east: 120.7 },
      'Davao': { south: 7.0, west: 125.3, north: 7.5, east: 125.8 },
      'Siargao': { south: 8.8, west: 126.0, north: 9.2, east: 126.2 },
    },
  },
  VN: {
    name: 'Vietnam',
    bounds: { south: 8.5, west: 102.0, north: 23.5, east: 110.0 },
    provinces: {
      'Hanoi': { south: 20.8, west: 105.5, north: 21.4, east: 106.0 },
      'Ho Chi Minh City': { south: 10.3, west: 106.3, north: 11.2, east: 107.0 },
      'Da Nang': { south: 15.8, west: 108.0, north: 16.2, east: 108.3 },
      'Hoi An': { south: 15.8, west: 108.2, north: 15.9, east: 108.4 },
      'Ha Long': { south: 20.8, west: 106.8, north: 21.2, east: 107.4 },
      'Nha Trang': { south: 12.1, west: 109.0, north: 12.3, east: 109.3 },
      'Hue': { south: 16.3, west: 107.4, north: 16.5, east: 107.7 },
      'Sapa': { south: 22.2, west: 103.7, north: 22.5, east: 104.0 },
    },
  },
};

const CORE_TAGS = [
  'tourism=attraction',
  'tourism=museum',
  'tourism=viewpoint',
  'tourism=zoo',
  'tourism=theme_park',
  'historic=monument',
  'historic=memorial',
  'historic=castle',
  'historic=fort',
  'historic=ruins',
  'historic=temple',
  'historic=mosque',
  'historic=church',
  'historic=shrine',
  'natural=beach',
  'natural=waterfall',
  'natural=volcano',
  'natural=peak',
  'natural=cave_entrance',
  'natural=island',
  'natural=park',
  'natural=national_park',
  'natural=nature_reserve',
  'leisure=park',
  'leisure=marina',
  'leisure=resort',
  'leisure=garden',
];

const ALL_TAGS = [
  ...CORE_TAGS,
  'tourism=gallery',
  'tourism=aquarium',
  'tourism=artwork',
  'tourism=information',
  'historic=archaeological_site',
  'historic=manor',
  'historic=wayside_shrine',
  'historic=city_gate',
  'historic=tomb',
  'natural=hot_spring',
  'natural=reef',
  'natural=geyser',
  'natural=rock',
  'natural=isthmus',
  'natural=cape',
  'natural=peninsula',
  'natural=bay',
  'natural=strait',
  'natural=glacier',
  'natural=scrub',
  'natural=grassland',
  'natural=wood',
  'natural=forest',
  'natural=protected_area',
  'natural=wilderness_hut',
  'natural=rock_formation',
  'natural=spring',
  'leisure=nature_reserve',
  'leisure=amusement_arcade',
  'leisure=golf_course',
  'leisure=stadium',
  'leisure=sports_centre',
  'leisure=swimming_pool',
  'leisure=playground',
  'leisure=dog_park',
  'leisure=fitness_station',
  'leisure=recreation_ground',
  'leisure=water_slide',
  'leisure=picnic_site',
  'leisure=bbq',
  'leisure=fishing',
  'leisure=horse_riding',
  'leisure=swimming_area',
];

function buildOverpassQuery(bounds, tags, limit = 30) {
  const { south, west, north, east } = bounds;
  const tagQueries = tags
    .map((tag) => {
      const [key, value] = tag.split('=');
      if (value) {
        return `node["${key}"="${value}"](${south},${west},${north},${east});`;
      }
      return `node["${key}"](${south},${west},${north},${east});`;
    })
    .join('\n');

  return `[out:json][timeout:25];(${tagQueries});out center qt ${limit};`;
}

function normalizePlace(place) {
  const tags = place.tags || {};
  const name = tags.name || tags['name:en'] || tags['name:id'] || 'Unknown Place';
  const lat = place.lat || (place.center && place.center.lat);
  const lon = place.lon || (place.center && place.center.lon);

  const category = tags.tourism
    ? tags.tourism.replace(/_/g, ' ')
    : tags.historic
    ? tags.historic.replace(/_/g, ' ')
    : tags.natural
    ? tags.natural.replace(/_/g, ' ')
    : tags.leisure
    ? tags.leisure.replace(/_/g, ' ')
    : 'other';

  const description =
    tags.description ||
    tags['description:en'] ||
    tags['description:id'] ||
    (tags.wikipedia ? `See Wikipedia: ${tags.wikipedia}` : '');

  return {
    id: place.id.toString(),
    type: place.type,
    name,
    category,
    description,
    lat,
    lon,
    address: {
      city: tags['addr:city'] || tags.city || null,
      province: tags['addr:province'] || tags.province || tags['addr:state'] || null,
      country: tags['addr:country'] || tags.country || null,
      street: tags['addr:street'] || null,
      suburb: tags['addr:suburb'] || tags.suburb || null,
      village: tags['addr:village'] || tags.village || null,
    },
    website: tags.website || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    openingHours: tags.opening_hours || null,
    fee: tags.fee || null,
    wheelchair: tags.wheelchair || null,
    image: tags.image || null,
    wikimediaCommons: tags.wikimedia_commons || null,
  };
}

async function fetchFromOverpass(query, endpointIndex = 0) {
  const endpoint = OVERPASS_ENDPOINTS[endpointIndex % OVERPASS_ENDPOINTS.length];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'WarisanLink/1.0 (https://warisan.link; owfaris@warisan.link)',
      },
      body: query.trim(),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Overpass API error: ${response.status} ${response.statusText} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (endpointIndex < OVERPASS_ENDPOINTS.length - 1) {
      return fetchFromOverpass(query, endpointIndex + 1);
    }
    throw error;
  }
}

router.get('/tourism', async (req, res) => {
  try {
    const { country = 'ID', province, category, search, limit = 30, page = 1 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 30, 100);
    const pageNum = Math.max(parseInt(page) || 1, 1);

    const countryData = COUNTRIES[country.toUpperCase()];
    if (!countryData) {
      return res.status(400).json({
        error: `Country "${country}" not found. Available: ${Object.keys(COUNTRIES).join(', ')}`,
      });
    }

    let bounds;
    if (province) {
      bounds = countryData.provinces[province];
      if (!bounds) {
        return res.status(400).json({
          error: `Province "${province}" not found for ${countryData.name}. Available: ${Object.keys(countryData.provinces).join(', ')}`,
        });
      }
    } else {
      bounds = countryData.bounds;
    }

    let tags = [...CORE_TAGS];
    if (category) {
      const categoryMap = {
        attraction: ['tourism=attraction'],
        museum: ['tourism=museum'],
        beach: ['natural=beach', 'leisure=beach_resort'],
        park: ['natural=park', 'natural=national_park', 'natural=nature_reserve', 'leisure=park'],
        temple: ['historic=temple', 'historic=shrine'],
        mosque: ['historic=mosque'],
        church: ['historic=church'],
        monument: ['historic=monument', 'historic=memorial'],
        viewpoint: ['tourism=viewpoint'],
        waterfall: ['natural=waterfall'],
        volcano: ['natural=volcano'],
        island: ['natural=island'],
        zoo: ['tourism=zoo'],
        theme_park: ['tourism=theme_park'],
        garden: ['leisure=garden'],
        marina: ['leisure=marina'],
        stadium: ['leisure=stadium'],
        swimming_pool: ['leisure=swimming_pool'],
        resort: ['leisure=resort'],
        fort: ['historic=fort'],
        ruins: ['historic=ruins'],
      };
      tags = categoryMap[category] || tags;
    }

    const query = buildOverpassQuery(bounds, tags, limitNum);
    const data = await fetchFromOverpass(query);

    let places = data.elements.map(normalizePlace);

    places = await enrichPlacesWithWeather(places);

    if (search) {
      const searchLower = search.toLowerCase();
      places = places.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.address.city && p.address.city.toLowerCase().includes(searchLower)) ||
          (p.address.province && p.address.province.toLowerCase().includes(searchLower))
      );
    }

    const total = places.length;
    const perPage = limitNum;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (pageNum - 1) * perPage;
    const paginatedPlaces = places.slice(startIndex, startIndex + perPage);

    res.json({
      success: true,
      data: paginatedPlaces,
      pagination: {
        total,
        page: pageNum,
        perPage,
        totalPages,
      },
      bounds,
      country: countryData.name,
    });
  } catch (error) {
    console.error('Error fetching tourism data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tourism data',
      message: error.message,
    });
  }
});

router.get('/tourism/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = Math.min(parseFloat(radius) || 5000, 50000);
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    const radiusDeg = radiusNum / 111320;

    const bounds = {
      south: latNum - radiusDeg,
      west: lonNum - radiusDeg,
      north: latNum + radiusDeg,
      east: lonNum + radiusDeg,
    };

    const query = buildOverpassQuery(bounds, CORE_TAGS, limitNum);
    const data = await fetchFromOverpass(query);

    const places = data.elements.map(normalizePlace);

    const enrichedPlaces = await enrichPlacesWithWeather(places);

    res.json({
      success: true,
      data: enrichedPlaces,
      center: { lat: latNum, lon: lonNum },
      radius: radiusNum,
    });
  } catch (error) {
    console.error('Error fetching nearby tourism data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby tourism data',
      message: error.message,
    });
  }
});

router.get('/tourism/countries', async (req, res) => {
  res.json({
    success: true,
    data: Object.entries(COUNTRIES).map(([code, data]) => ({
      code,
      name: data.name,
      provinceCount: Object.keys(data.provinces).length,
    })),
  });
});

router.get('/tourism/provinces', async (req, res) => {
  const { country = 'ID' } = req.query;
  const countryData = COUNTRIES[country.toUpperCase()];

  if (!countryData) {
    return res.status(400).json({
      error: `Country "${country}" not found. Available: ${Object.keys(COUNTRIES).join(', ')}`,
    });
  }

  res.json({
    success: true,
    data: Object.entries(countryData.provinces).map(([name, bounds]) => ({
      name,
      bounds,
    })),
    country: countryData.name,
  });
});

router.get('/tourism/categories', async (req, res) => {
  const categoryMap = {
    attraction: 'Tourist Attractions',
    museum: 'Museums',
    beach: 'Beaches',
    park: 'Parks & Nature Reserves',
    temple: 'Temples & Shrines',
    mosque: 'Mosques',
    church: 'Churches',
    monument: 'Monuments & Memorials',
    viewpoint: 'Viewpoints',
    waterfall: 'Waterfalls',
    volcano: 'Volcanoes',
    island: 'Islands',
    zoo: 'Zoos',
    theme_park: 'Theme Parks',
    garden: 'Gardens',
    marina: 'Marinas',
    stadium: 'Stadiums',
    swimming_pool: 'Swimming Pools',
    resort: 'Resorts',
    fort: 'Forts',
    ruins: 'Ruins',
  };

  res.json({
    success: true,
    data: Object.entries(categoryMap).map(([slug, name]) => ({ slug, name })),
  });
});

export default router;
