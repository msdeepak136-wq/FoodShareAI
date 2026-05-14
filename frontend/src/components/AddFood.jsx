import { useState } from 'react';

const FOOD_TYPES = ['dairy', 'meat', 'seafood', 'vegetables', 'fruits', 'bakery', 'cooked', 'grains', 'beverages', 'other'];

export default function AddFood({ role, onFoodAdded, onBack }) {
  const [form, setForm] = useState({
    name: '',
    type: 'vegetables',
    quantity: '',
    unit: 'kg',
    hoursRemaining: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.hoursRemaining) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (data.success) {
        onFoodAdded(data.data);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const riskPreview = form.quantity && form.hoursRemaining
    ? parseInt(form.hoursRemaining) < 12 ? 'HIGH' : parseInt(form.hoursRemaining) < 36 ? 'MEDIUM' : 'LOW'
    : null;

  return (
    <div className="page">
      {/* Header */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(240,244,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        ← Back
      </button>
      <div className="section-header">
        <h2>➕ Add Food Item</h2>
        <p>Our AI will instantly predict spoilage risk</p>
      </div>

      {/* AI Preview Banner */}
      {riskPreview && (
        <div className={`alert alert-${riskPreview === 'HIGH' ? 'danger' : riskPreview === 'MEDIUM' ? 'warning' : 'success'}`} style={{ marginBottom: '1rem' }}>
          🧠 AI Prediction: <strong>{riskPreview} risk</strong> — {riskPreview === 'HIGH' ? 'Donate ASAP!' : riskPreview === 'MEDIUM' ? 'Plan donation soon' : 'Food is stable'}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} id="form-add-food">
        <div className="input-group">
          <label>Food Name *</label>
          <input id="input-food-name" type="text" placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div className="input-group">
          <label>Food Category *</label>
          <select id="select-food-type" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {FOOD_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
          <div className="input-group">
            <label>Quantity *</label>
            <input id="input-quantity" type="number" min="0.1" step="0.1" placeholder="50" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Unit</label>
            <select id="select-unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {['kg', 'lbs', 'units', 'litres'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Hours Until Expiry *</label>
          <input id="input-hours" type="number" min="1" step="1" placeholder="24" value={form.hoursRemaining} onChange={(e) => set('hoursRemaining', e.target.value)} />
        </div>

        <div className="input-group">
          <label>Pickup Location</label>
          <input id="input-location" type="text" placeholder="e.g. Koramangala, Bengaluru" value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>

        <button id="btn-submit-food" type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
          {loading ? '🧠 Analyzing...' : '🔍 Predict & Match NGO →'}
        </button>
      </form>
    </div>
  );
}
