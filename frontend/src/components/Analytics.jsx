import { useState, useEffect } from 'react';

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
}

const impactGoals = [
  { label: 'Annual Meals Saved', target: 50000, unit: 'meals', emoji: '🍽️' },
  { label: 'CO₂ Prevented', target: 10, unit: 'tonnes', emoji: '🌍' },
  { label: 'Families Fed', target: 200, unit: 'families', emoji: '👨‍👩‍👧‍👦' },
];

export default function Analytics({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/match/analytics')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="section-header">
        <h2>📊 Impact Analytics</h2>
        <p>Your contribution to a zero-waste world</p>
      </div>

      {/* Live Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,244,255,0.4)', marginBottom: '0.75rem' }}>🔴 Live Session Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Food Added', value: data?.totalItems ?? 0, unit: 'items', color: '#00d4aa' },
                { label: 'NGO Matched', value: data?.matchedItems ?? 0, unit: 'items', color: '#6c63ff' },
                { label: 'Meals Saved', value: data?.totalMealsSaved ?? 0, unit: 'meals', color: '#ffd166' },
                { label: 'CO₂ Saved', value: data?.totalCO2Saved ?? 0, unit: 'kg', color: '#06d6a0' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="stat-tile">
                  <div className="stat-value" style={{ color }}><AnimatedCounter target={value} /></div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(240,244,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.1rem' }}>{unit}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* National Goals */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f0f4ff', marginBottom: '0.85rem' }}>🎯 Platform Impact Goals (Annual)</p>
        {impactGoals.map((goal) => {
          const pct = Math.min(100, Math.round(((data?.totalMealsSaved ?? 0) / goal.target) * 100)) || 2;
          return (
            <div key={goal.label} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f4ff' }}>{goal.emoji} {goal.label}</span>
                <span style={{ fontSize: '0.78rem', color: '#00d4aa', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill low" style={{ width: `${pct}%` }} />
              </div>
              <p style={{ fontSize: '0.72rem', marginTop: '0.25rem' }}>Goal: {goal.target.toLocaleString()} {goal.unit}</p>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="card">
        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f0f4ff', marginBottom: '0.8rem' }}>💡 How FoodNova Works</p>
        {[
          { step: '1', icon: '➕', title: 'Add Food', desc: 'Log your surplus food inventory' },
          { step: '2', icon: '🧠', title: 'AI Predicts', desc: 'Instant spoilage risk score' },
          { step: '3', icon: '🤝', title: 'NGO Match', desc: 'Most compatible NGO found' },
          { step: '4', icon: '🗺️', title: 'Route Optimized', desc: 'Fastest, cheapest path planned' },
          { step: '5', icon: '✅', title: 'Delivered', desc: 'Food saved, CO₂ reduced' },
        ].map(({ step, icon, title, desc }) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f0f4ff' }}>{title}</p>
              <p style={{ fontSize: '0.75rem' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
