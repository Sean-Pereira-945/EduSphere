import React from 'react';

const PILLARS = [
  {
    num: '01',
    title: 'Technical Development',
    desc: 'Mastering algorithm design, full-stack systems, and modern software architectures through hands-on coding tracks.',
    color: 'var(--accent-cyan)',
    glow: 'rgba(0, 242, 254, 0.15)',
    border: 'rgba(0, 242, 254, 0.35)',
  },
  {
    num: '02',
    title: 'Non-Technical Aptitude',
    desc: 'Refining engineering mathematics, quantitative aptitude, logical reasoning, and complex problem-solving capabilities.',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.35)',
  },
  {
    num: '03',
    title: 'Self-Development & Logic',
    desc: 'Unlocking cognitive reasoning, behavioral psychology, public speaking, and professional leadership mentoring.',
    color: 'var(--accent-indigo)',
    glow: 'rgba(79, 172, 254, 0.15)',
    border: 'rgba(79, 172, 254, 0.35)',
  },
  {
    num: '04',
    title: 'Extra-Curricular Tracks',
    desc: 'Exploring creative design, community-driven projects, environmental wellness, and institutional activities.',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.35)',
  },
];

export default function AboutSection({ sectionRef }) {
  return (
    <section
      id="about"
      className="section-container"
      ref={sectionRef}
      style={{ padding: '120px 0', background: 'transparent' }}
    >
      <div className="section-content">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '60px',
          alignItems: 'start',
        }}>

          {/* ── Left: Robot Placeholder (Crucial for scroll-based positioning) ── */}
          <div 
            className="about-robot-placeholder" 
            style={{ 
              minHeight: '450px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
          />

          {/* ── Right: Content & Bento Feature Grid ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Header Area */}
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                marginBottom: '12px',
                textShadow: '0 0 10px rgba(0, 242, 254, 0.2)'
              }}>
                Institutional Vision
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.8rem',
                fontWeight: '800',
                lineHeight: '1.2',
                background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
              }}>
                Bridging theory with industry readiness
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-muted)',
                lineHeight: '1.7',
                maxWidth: '620px',
              }}>
                The <strong style={{ color: '#fff' }}>Learning &amp; Leadership Center</strong> serves as Fr. CRCE's premier academic incubator—combining structured coursework, assignments, and mentorship into a singular cyber-dark portal.
              </p>
            </div>

            {/* Bento Grid layout for Pillars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              marginTop: '10px'
            }}>
              {PILLARS.map((p, i) => (
                <div
                  key={i}
                  className="edusphere-card"
                  style={{
                    padding: '28px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = p.border;
                    e.currentTarget.style.boxShadow = `0 10px 30px -10px ${p.glow}, inset 0 0 15px ${p.glow}`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Subtle top indicator line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: p.color,
                    opacity: 0.8
                  }} />

                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: p.color,
                      letterSpacing: '0.05em'
                    }}>
                      {p.num}
                    </span>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: p.color,
                      boxShadow: `0 0 8px ${p.color}`
                    }} />
                  </div>

                  {/* Card Body */}
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      {p.title}
                    </h3>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
