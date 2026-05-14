const roles = [
  {
    id: 'farmer',
    emoji: '🌾',
    title: 'Farmer',
    desc: "Track crop surplus, predict spoilage, donate before it's too late.",
    color: '#00d4aa',
    glow: 'rgba(0,212,170,0.2)',
  },
  {
    id: 'supplier',
    emoji: '🏭',
    title: 'Supplier',
    desc: 'Manage warehouse inventory and redirect overstock to communities.',
    color: '#6c63ff',
    glow: 'rgba(108,99,255,0.2)',
  },
  {
    id: 'ngo',
    emoji: '🏠',
    title: 'NGO',
    desc: 'Receive real-time food availability alerts and schedule pickup.',
    color: '#ffd166',
    glow: 'rgba(255,209,102,0.2)',
  },
];

export default function RoleSelection({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,244,255,0.45)', marginBottom: '0.6rem' }}>Step 1 of 1</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.9rem', marginBottom: '0.4rem' }}>Who are you?</h2>
        <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Choose your role to get a personalized experience</p>
      </div>

      {/* Role Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {roles.map((role) => (
          <button
            key={role.id}
            id={`role-${role.id}`}
            onClick={() => onSelect(role.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              border: `1.5px solid rgba(255,255,255,0.1)`,
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = role.color;
              e.currentTarget.style.boxShadow = `0 0 28px ${role.glow}`;
              e.currentTarget.style.background = role.glow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <div style={{
              width: 52, height: 52,
              background: role.glow,
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem',
              flexShrink: 0,
              border: `1px solid ${role.color}33`,
            }}>
              {role.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#f0f4ff', marginBottom: '0.2rem' }}>{role.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.55)', lineHeight: 1.4 }}>{role.desc}</p>
            </div>
            <span style={{ fontSize: '1.1rem', color: 'rgba(240,244,255,0.3)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
