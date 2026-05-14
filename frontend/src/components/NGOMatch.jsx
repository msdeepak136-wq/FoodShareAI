import { useState, useEffect, useRef } from 'react';
import LiveMap from './LiveMap';

export default function NGOMatch({ food, onRouteView, onBack }) {
  const [ngos, setNgos] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [matching, setMatching] = useState(false);
  const [smsModal, setSmsModal] = useState(null); // ngo object
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  // Step 1: Get user GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported — using default location (Bengaluru).');
      setUserPos({ lat: 12.9716, lng: 77.5946 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setGeoError('Location permission denied — using Bengaluru centre as default.');
        setUserPos({ lat: 12.9716, lng: 77.5946 });
      },
      { timeout: 8000 }
    );
  }, []);

  // Step 2: Once we have location, fetch real NGOs from Overpass via our backend
  useEffect(() => {
    if (!userPos) return;
    setLoading(true);
    fetch(`/api/ngos/nearby?lat=${userPos.lat}&lng=${userPos.lng}&radius=12000`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setNgos(data.data);
          setSelected(data.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userPos]);

  const handleConfirmMatch = async () => {
    if (!food?.id || !selected) return;
    setMatching(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: food.id }),
      });
      const data = await res.json();
      if (data.success) {
        // Override route destination with actually selected NGO
        const result = {
          ...data.data,
          selectedNGO: selected,
          route: {
            ...data.data.route,
            destination: selected.name,
            distanceKm: selected.distance,
            travelTimeMin: Math.round(selected.distance * 4),
            fuelCostINR: Math.round(selected.distance * 7),
            optimizationSavings: {
              distanceKm: parseFloat((selected.distance * 0.18).toFixed(1)),
              timeMin: Math.round(selected.distance * 0.7),
              fuelCostINR: Math.round(selected.distance * 1.2),
              co2Kg: parseFloat((selected.distance * 0.12).toFixed(2)),
            },
            waypoints: [
              { step: 1, label: 'Pickup Point', distanceFromStart: 0, timeMin: 0 },
              { step: 2, label: 'Checkpoint 1', distanceFromStart: parseFloat((selected.distance * 0.4).toFixed(1)), timeMin: Math.round(selected.distance * 1.6) },
              { step: 3, label: 'Checkpoint 2', distanceFromStart: parseFloat((selected.distance * 0.75).toFixed(1)), timeMin: Math.round(selected.distance * 3) },
              { step: 4, label: 'NGO Delivery', distanceFromStart: selected.distance, timeMin: Math.round(selected.distance * 4) },
            ],
          },
          userPos,
        };
        onRouteView(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatching(false);
    }
  };

  const openSmsModal = (ngo) => {
    setSmsModal(ngo);
    setSmsPhone(ngo.contact || '');
    setSmsSent(false);
  };

  const sendSms = () => {
    if (!smsPhone) return;
    const foodName = food?.name || 'food items';
    const qty = food ? `${food.quantity}${food.unit}` : '';
    const msg = `Hello ${smsModal.name}, we have ${qty} of ${foodName} available for donation near ${food?.location || 'our location'}. Please confirm pickup. - FoodNova`;
    const cleaned = smsPhone.replace(/\s+/g, '');
    window.open(`sms:${cleaned}?body=${encodeURIComponent(msg)}`, '_self');
    setSmsSent(true);
    setTimeout(() => setSmsModal(null), 2000);
  };

  const riskColor = { HIGH: '#ff4d6d', MEDIUM: '#ffd166', LOW: '#06d6a0' };

  return (
    <div className="page">
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(240,244,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem' }}>
        ← Back
      </button>

      {/* Food summary */}
      {food && (
        <div className="card" style={{ marginBottom: '1.1rem', background: 'rgba(255,255,255,0.04)', borderColor: `${riskColor[food.ai?.riskLevel] || '#00d4aa'}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🍱</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{food.name}</strong>
                <span className={`badge badge-${food.ai?.riskLevel?.toLowerCase()}`}>{food.ai?.riskLevel}</span>
              </div>
              <p style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                {food.quantity}{food.unit} · {food.hoursRemaining}h left · Risk {food.ai?.riskScore}/100
              </p>
            </div>
          </div>
          {food.ai?.recommendation && (
            <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, fontSize: '0.78rem' }}>
              🧠 <strong>AI:</strong> {food.ai.recommendation}
            </div>
          )}
        </div>
      )}

      {/* Geo warning */}
      {geoError && <div className="alert alert-warning" style={{ fontSize: '0.78rem' }}>📍 {geoError}</div>}

      {/* Live Map */}
      {userPos && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            🗺️ Live NGO Map
          </p>
          <LiveMap
            userLat={userPos.lat}
            userLng={userPos.lng}
            ngos={ngos}
            selectedNgoId={selected?.id}
            onSelectNgo={setSelected}
            style={{ height: 220 }}
          />
        </div>
      )}

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.05rem' }}>🤝 Nearby NGOs</h3>
        {!loading && <span style={{ fontSize: '0.72rem', color: '#00d4aa' }}>{ngos.length} found</span>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 88, borderRadius: 14 }} />)}
        </div>
      ) : ngos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <p>No NGOs found nearby. Try increasing the search radius.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {ngos.map((ngo, idx) => {
            const isSelected = selected?.id === ngo.id;
            return (
              <div
                key={ngo.id}
                id={`ngo-card-${idx}`}
                onClick={() => setSelected(ngo)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.8rem',
                  padding: '0.9rem', borderRadius: 14, cursor: 'pointer',
                  background: isSelected ? 'rgba(0,212,170,0.07)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSelected ? 'rgba(0,212,170,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: idx === 0 ? 'rgba(255,209,102,0.15)' : 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, border: `1px solid ${idx === 0 ? 'rgba(255,209,102,0.3)' : 'rgba(108,99,255,0.2)'}` }}>
                  🏠
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                    {idx === 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ffd166', background: 'rgba(255,209,102,0.15)', padding: '0.15rem 0.5rem', borderRadius: 50 }}>⭐ Closest</span>}
                    {ngo.source === 'live' && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00d4aa', background: 'rgba(0,212,170,0.1)', padding: '0.15rem 0.5rem', borderRadius: 50 }}>🟢 Live</span>}
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ngo.name}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem' }}>📍 {ngo.location} · ⏱ ~{Math.round(ngo.distance * 4)} min</p>
                  {ngo.contact && <p style={{ fontSize: '0.73rem', color: 'rgba(240,244,255,0.4)' }}>📞 {ngo.contact}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#00d4aa' }}>{ngo.distance} km</div>
                  <button
                    id={`btn-sms-${idx}`}
                    onClick={(e) => { e.stopPropagation(); openSmsModal(ngo); }}
                    style={{ marginTop: '0.3rem', fontSize: '0.68rem', padding: '0.25rem 0.6rem', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8, color: '#aaa6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    💬 Notify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm match button */}
      {selected && (
        <button
          id="btn-view-route"
          className="btn btn-primary btn-full"
          onClick={handleConfirmMatch}
          disabled={matching}
          style={{ position: 'sticky', bottom: '70px', boxShadow: '0 4px 24px rgba(0,212,170,0.35)' }}
        >
          {matching ? '⏳ Planning route...' : `🗺️ Route to ${selected.name.split(' ').slice(0, 2).join(' ')} →`}
        </button>
      )}

      {/* SMS Modal */}
      {smsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: 430, background: '#0f1521', borderRadius: '20px 20px 0 0', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.4rem' }}>💬 Notify NGO</h3>
            <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Send an SMS message to <strong style={{ color: '#f0f4ff' }}>{smsModal.name}</strong></p>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                id="input-sms-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: '0.78rem', color: 'rgba(240,244,255,0.6)', marginBottom: '1rem', fontStyle: 'italic' }}>
              "Hello {smsModal.name}, we have {food?.quantity}{food?.unit} of {food?.name} available for donation near {food?.location || 'our location'}. Please confirm pickup. - FoodNova"
            </div>
            {smsSent ? (
              <div className="alert alert-success">✅ SMS opened! Check your messages app.</div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button id="btn-send-sms" className="btn btn-primary" style={{ flex: 1 }} onClick={sendSms} disabled={!smsPhone}>
                  📱 Open SMS
                </button>
                <button className="btn btn-outline" onClick={() => setSmsModal(null)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
