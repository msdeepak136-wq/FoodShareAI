import { useState, useEffect } from 'react';

export default function Dashboard({ role, onAddFood, onMatchFood, onStats }) {
  const [foods, setFoods] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/food').then((r) => r.json()),
      fetch('/api/match/analytics').then((r) => r.json()),
    ])
      .then(([foodData, analyticsData]) => {
        setFoods(foodData.data || []);
        setAnalytics(analyticsData.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleConfig = {
    farmer: { greeting: 'Good morning, Farmer! 🌾', tip: 'Check your expiring crops below.' },
    supplier: { greeting: 'Welcome, Supplier! 🏭', tip: 'Review warehouse surplus items.' },
    ngo: { greeting: 'Hello, NGO Partner! 🏠', tip: 'Food matches are ready for pickup.' },
  };
  const rc = roleConfig[role] || roleConfig.farmer;

  const getRiskColor = (level) => level === 'HIGH' ? '#ff4d6d' : level === 'MEDIUM' ? '#ffd166' : '#06d6a0';
  const getRiskClass = (level) => level?.toLowerCase();

  return (
    <div className="page">
      {/* Greeting */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', marginBottom: '0.25rem' }}>{rc.greeting}</h2>
        <p style={{ fontSize: '0.83rem' }}>{rc.tip}</p>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {[1,2,3].map(i => <div key={i} className="stat-tile shimmer" style={{ height: 72 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div className="stat-tile">
            <div className="stat-value">{analytics?.totalItems ?? 0}</div>
            <div className="stat-label">Items</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value" style={{ color: '#ffd166' }}>{analytics?.matchedItems ?? 0}</div>
            <div className="stat-label">Matched</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value" style={{ color: '#6c63ff' }}>{analytics?.totalMealsSaved ?? 0}</div>
            <div className="stat-label">Meals</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <button id="btn-add-food" className="btn btn-primary" style={{ flex: 1 }} onClick={onAddFood}>
          ➕ Add Food
        </button>
        <button id="btn-view-stats" className="btn btn-secondary btn-sm" onClick={onStats} style={{ flexShrink: 0, padding: '0.85rem 1rem' }}>
          📊
        </button>
      </div>

      {/* Food List */}
      <div className="section-header">
        <h3>🍱 Food Inventory</h3>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2].map(i => <div key={i} className="shimmer" style={{ height: 96, borderRadius: 16 }} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</p>
          <p style={{ fontWeight: 600, color: '#f0f4ff', marginBottom: '0.4rem' }}>No items yet</p>
          <p style={{ fontSize: '0.82rem' }}>Add food to start reducing waste</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {foods.map((food) => (
            <div key={food.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onMatchFood(food)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <div className={`icon-circle ${food.ai?.riskLevel === 'HIGH' ? 'danger' : food.ai?.riskLevel === 'MEDIUM' ? 'warning' : 'primary'}`}>
                  🍱
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{food.name}</span>
                    <span className={`badge badge-${getRiskClass(food.ai?.riskLevel)}`}>
                      {food.ai?.riskLevel === 'HIGH' ? '🔴' : food.ai?.riskLevel === 'MEDIUM' ? '🟡' : '🟢'} {food.ai?.riskLevel}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                    {food.quantity}{food.unit} · {food.hoursRemaining}h left · {food.location}
                  </p>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getRiskClass(food.ai?.riskLevel)}`}
                      style={{ width: `${food.ai?.riskScore ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
