import { useState } from 'react';
import LiveMap from './LiveMap';

export default function MapRoute({ matchResult, onComplete, onBack }) {
  const [completed, setCompleted] = useState(false);
  const [phone, setPhone] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const route = matchResult?.route;
  const ngo = matchResult?.selectedNGO || matchResult?.matches?.[0];
  const food = matchResult?.food;
  const userPos = matchResult?.userPos;

  // Build route points for Leaflet
  const routePoints =
    userPos && ngo?.lat && ngo?.lng
      ? [
          [userPos.lat, userPos.lng],
          [ngo.lat, ngo.lng],
        ]
      : null;

  const sendSms = () => {
    if (!phone || !ngo) return;
    const foodLabel = food ? `${food.quantity}${food.unit} of ${food.name}` : 'food items';
    const msg = `Hello ${ngo.name}, your delivery of ${foodLabel} from FoodNova is on the way! ETA: ~${route?.travelTimeMin || '?'} minutes. Please be ready for pickup. Thank you 🙏 - FoodNova`;
    const cleaned = phone.replace(/\s+/g, '');
    window.open(`sms:${cleaned}?body=${encodeURIComponent(msg)}`, '_self');
    setSmsSent(true);
  };

  if (!route || !ngo) {
    return (
      <div className="page">
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(240,244,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem' }}>
          ← Back
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗺️</p>
          <p style={{ fontWeight: 600, color: '#f0f4ff' }}>No route data available</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>Match a food item first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(240,244,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem' }}>
        ← Back
      </button>

      <div className="section-header">
        <h2>🗺️ Live Route Map</h2>
        <p>Optimized path to <strong style={{ color: '#f0f4ff' }}>{ngo.name}</strong></p>
      </div>

      {/* Real Leaflet Route Map */}
      {userPos ? (
        <div style={{ marginBottom: '1rem' }}>
          <LiveMap
            userLat={userPos.lat}
            userLng={userPos.lng}
            ngos={[ngo]}
            selectedNgoId={ngo.id}
            routePoints={routePoints}
            style={{ height: 230 }}
          />
        </div>
      ) : (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 14, marginBottom: '1rem' }}>
          <span style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.85rem' }}>📍 Location not available for map</span>
        </div>
      )}

      {/* Route stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.1rem' }}>
        <div className="stat-tile">
          <div className="stat-value">{route.distanceKm}<span style={{ fontSize: '0.7rem', fontWeight: 400 }}> km</span></div>
          <div className="stat-label">Distance</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{route.travelTimeMin}<span style={{ fontSize: '0.7rem', fontWeight: 400 }}> min</span></div>
          <div className="stat-label">ETA</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value" style={{ color: '#ffd166' }}>₹{route.fuelCostINR}</div>
          <div className="stat-label">Fuel Cost</div>
        </div>
      </div>

      {/* AI savings */}
      {route.optimizationSavings && (
        <div className="card" style={{ marginBottom: '1.1rem', background: 'rgba(0,212,170,0.06)', borderColor: 'rgba(0,212,170,0.2)' }}>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f0f4ff', marginBottom: '0.6rem' }}>✅ AI Optimization Savings</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {[
              { label: 'Distance saved', value: `${route.optimizationSavings.distanceKm} km`, icon: '📍' },
              { label: 'Time saved', value: `${route.optimizationSavings.timeMin} min`, icon: '⏱️' },
              { label: 'Fuel saved', value: `₹${route.optimizationSavings.fuelCostINR}`, icon: '⛽' },
              { label: 'CO₂ avoided', value: `${route.optimizationSavings.co2Kg} kg`, icon: '🌍' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(240,244,255,0.45)', marginBottom: '0.15rem' }}>{icon} {label}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.95rem', color: '#00d4aa' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waypoints */}
      {route.waypoints && (
        <div className="card" style={{ marginBottom: '1.1rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.7rem', color: '#f0f4ff' }}>📍 Route Steps</p>
          {route.waypoints.map((wp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: i < route.waypoints.length - 1 ? '0.55rem' : 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'rgba(0,212,170,0.2)' : i === route.waypoints.length - 1 ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? '#00d4aa' : i === route.waypoints.length - 1 ? '#6c63ff' : 'rgba(240,244,255,0.4)', flexShrink: 0 }}>
                {wp.step}
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f4ff' }}>{wp.label}</span>
                <span style={{ fontSize: '0.73rem', color: 'rgba(240,244,255,0.35)', marginLeft: '0.4rem' }}>+{wp.distanceFromStart}km · ~{wp.timeMin}m</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Flow */}
      {!completed ? (
        <button id="btn-complete-delivery" className="btn btn-primary btn-full" onClick={() => { setCompleted(true); setShowPhoneInput(true); }}>
          🚀 Mark Delivery Complete
        </button>
      ) : (
        <div>
          <div className="alert alert-success">🎉 Delivery completed! Great work saving food.</div>

          {/* SMS Notification to NGO upon delivery */}
          {showPhoneInput && (
            <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(0,212,170,0.25)' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f0f4ff', marginBottom: '0.6rem' }}>
                📱 Notify NGO via SMS
              </p>
              <p style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                Send a delivery confirmation message to <strong style={{ color: '#f0f4ff' }}>{ngo.name}</strong>
              </p>
              <div className="input-group">
                <label>NGO Phone Number</label>
                <input
                  id="input-delivery-phone"
                  type="tel"
                  placeholder={ngo.contact || "+91 98765 43210"}
                  value={phone || ngo.contact || ''}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div style={{ padding: '0.65rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, fontSize: '0.75rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.75rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                "Hello {ngo.name}, your delivery of {food ? `${food.quantity}${food.unit} of ${food.name}` : 'food items'} from FoodNova is on the way! ETA: ~{route?.travelTimeMin || '?'} minutes. Please be ready. 🙏 - FoodNova"
              </div>
              {smsSent ? (
                <div className="alert alert-success" style={{ marginBottom: '0.75rem' }}>✅ SMS app opened! Message ready to send.</div>
              ) : (
                <button id="btn-send-delivery-sms" className="btn btn-secondary btn-full" style={{ marginBottom: '0.75rem' }} onClick={sendSms} disabled={!phone && !ngo.contact}>
                  💬 Send Delivery SMS
                </button>
              )}
            </div>
          )}

          <button id="btn-view-impact" className="btn btn-primary btn-full" onClick={onComplete}>
            📊 View Your Impact →
          </button>
        </div>
      )}
    </div>
  );
}
