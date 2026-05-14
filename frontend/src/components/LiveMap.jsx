import { useEffect, useRef } from 'react';

// Custom colored marker SVG factory
function makeIcon(color = '#00d4aa', label = '') {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <ellipse cx="16" cy="40" rx="6" ry="2" fill="rgba(0,0,0,0.25)"/>
      <path d="M16 0 C8.27 0 2 6.27 2 14 C2 24 16 40 16 40 S30 24 30 14 C30 6.27 23.73 0 16 0Z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
      <circle cx="16" cy="14" r="7" fill="rgba(255,255,255,0.9)"/>
      <text x="16" y="18" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="${color}">${label}</text>
    </svg>
  `);
  return `data:image/svg+xml,${svg}`;
}

/**
 * LiveMap — a reusable Leaflet map component.
 *
 * Props:
 *  userLat, userLng  — user GPS position (required)
 *  ngos              — array of { id, name, lat, lng, distance, contact } objects
 *  selectedNgoId     — ID of selected NGO (highlighted marker)
 *  onSelectNgo       — callback(ngo) when marker/popup is clicked
 *  routePoints       — [[lat,lng], [lat,lng]] to draw a route polyline
 *  style             — container style (default: full width 260px tall)
 */
export default function LiveMap({
  userLat,
  userLng,
  ngos = [],
  selectedNgoId,
  onSelectNgo,
  routePoints,
  style = {},
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !userLat || !userLng) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Avoid double-init
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      // User marker (green pin)
      const userIcon = L.icon({ iconUrl: makeIcon('#00d4aa', 'You'), iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -42] });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>📍 Your Location</b>')
        .openPopup();

      // Pulse circle around user
      L.circle([userLat, userLng], { radius: 300, color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.08, weight: 1 }).addTo(map);

      // NGO markers
      markersRef.current = ngos.map((ngo, i) => {
        const isSelected = ngo.id === selectedNgoId;
        const color = isSelected ? '#6c63ff' : i === 0 ? '#ffd166' : 'rgba(200,200,220,0.9)';
        const ngoIcon = L.icon({ iconUrl: makeIcon(color, `${i + 1}`), iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -40] });

        const marker = L.marker([ngo.lat, ngo.lng], { icon: ngoIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <b style="color:#333">${ngo.name}</b><br/>
            <span style="color:#666;font-size:12px">📍 ${ngo.location}</span><br/>
            <span style="color:#666;font-size:12px">📏 ${ngo.distance} km away</span>
            ${ngo.contact ? `<br/><span style="color:#666;font-size:12px">📞 ${ngo.contact}</span>` : ''}
            ${onSelectNgo ? `<br/><button onclick="window._selectNgo('${ngo.id}')" style="margin-top:6px;padding:4px 10px;background:#6c63ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">Select NGO</button>` : ''}
          </div>
        `);
        return { marker, ngo };
      });

      // Global callback for popup button
      if (onSelectNgo) {
        window._selectNgo = (id) => {
          const found = ngos.find((n) => n.id === id);
          if (found) onSelectNgo(found);
        };
      }

      // Route polyline
      if (routePoints && routePoints.length >= 2) {
        routeRef.current = L.polyline(routePoints, {
          color: '#00d4aa',
          weight: 4,
          opacity: 0.85,
          dashArray: '10 6',
        }).addTo(map);
        map.fitBounds(L.latLngBounds(routePoints), { padding: [30, 30] });
      } else if (ngos.length > 0) {
        // Fit to show user + all NGOs
        const bounds = [[userLat, userLng], ...ngos.map((n) => [n.lat, n.lng])];
        map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 14 });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      delete window._selectNgo;
    };
  }, [userLat, userLng, JSON.stringify(ngos), selectedNgoId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 240,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        background: '#111',
        ...style,
      }}
    />
  );
}
