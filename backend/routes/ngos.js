const express = require('express');
const router = express.Router();
const db = require('../database');

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/ngos - list seeded NGOs
router.get('/', (req, res) => {
  res.json({ success: true, data: db.ngos });
});

// GET /api/ngos/nearby?lat=&lng=&radius=
// Queries Overpass API for real NGOs, falls back to seeded list
router.get('/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseInt(req.query.radius) || 10000; // metres

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  let ngos = [];

  try {
    // Query Overpass for social facilities, food banks, NGOs, charitable orgs near user
    const overpassQuery = `
[out:json][timeout:20];
(
  node["amenity"="social_facility"](around:${radius},${lat},${lng});
  node["social_facility"="food_bank"](around:${radius},${lat},${lng});
  node["amenity"="food_bank"](around:${radius},${lat},${lng});
  node["charity"](around:${radius},${lat},${lng});
  node["office"="ngo"](around:${radius},${lat},${lng});
  node["office"="charity"](around:${radius},${lat},${lng});
  node["name"~"Foundation|Trust|NGO|Charitable|Relief|Society|Welfare",i](around:${radius},${lat},${lng});
);
out body;
`;

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(12000),
    });

    if (overpassRes.ok) {
      const data = await overpassRes.json();
      const elements = data.elements || [];

      ngos = elements
        .filter((el) => el.lat && el.lon && el.tags?.name)
        .map((el) => {
          const dist = parseFloat(haversine(lat, lng, el.lat, el.lon).toFixed(2));
          return {
            id: `osm-${el.id}`,
            name: el.tags.name,
            location: el.tags['addr:city'] || el.tags['addr:suburb'] || el.tags['addr:street'] || 'Nearby',
            lat: el.lat,
            lng: el.lon,
            capacity: el.tags.capacity ? parseInt(el.tags.capacity) : Math.floor(Math.random() * 300 + 100),
            contact: el.tags.phone || el.tags['contact:phone'] || '',
            category: el.tags.social_facility || el.tags.amenity || el.tags.office || 'NGO',
            distance: dist,
            source: 'live',
          };
        })
        .filter((n) => n.distance <= radius / 1000)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8);
    }
  } catch (err) {
    console.warn('Overpass API failed, using fallback NGOs:', err.message);
  }

  // Fallback: use seeded NGOs with real distance from user
  if (ngos.length === 0) {
    ngos = db.ngos
      .map((ngo) => ({
        ...ngo,
        distance: parseFloat(haversine(lat, lng, ngo.lat, ngo.lng).toFixed(2)),
        source: 'fallback',
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  res.json({ success: true, data: ngos, userLat: lat, userLng: lng });
});

module.exports = router;
