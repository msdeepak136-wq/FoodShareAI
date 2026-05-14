import { useEffect, useRef } from 'react';

export default function Splash({ onContinue }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 170, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ fontSize: '5.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 0 40px rgba(0,212,170,0.5))' }}>
          🌿
        </div>

        {/* Brand */}
        <h1 style={{
          fontSize: '3rem',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #00d4aa, #6c63ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          lineHeight: 1,
        }}>
          FoodNova
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'rgba(240,244,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
          Reduce Waste. Feed More.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
          {['🧠 AI Spoilage', '🤝 NGO Match', '🗺️ Route AI', '📊 Impact'].map((f) => (
            <span key={f} style={{
              padding: '0.4rem 0.9rem',
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.25)',
              borderRadius: '50px',
              fontSize: '0.78rem',
              color: '#00d4aa',
              fontWeight: 600,
            }}>{f}</span>
          ))}
        </div>

        <button id="btn-get-started" className="btn btn-primary btn-full" onClick={onContinue} style={{ maxWidth: '260px', fontSize: '1rem', padding: '1rem 2rem' }}>
          Get Started →
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(240,244,255,0.3)' }}>
          Powered by AI • Zero waste mission
        </p>
      </div>
    </div>
  );
}
