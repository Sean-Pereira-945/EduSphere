import React, { useRef, useState, useCallback } from 'react';

const PILLARS = [
  {
    num: '01', label: 'Pillar 01', title: 'Technical',
    color: '#00f2fe',
    bg: 'linear-gradient(160deg, rgba(0,14,24,0.95) 0%, rgba(0,30,42,0.92) 100%)',
    border: 'rgba(0,242,254,0.45)',
    glow: 'rgba(0,242,254,0.18)',
    line: '#00f2fe',
  },
  {
    num: '02', label: 'Pillar 02', title: 'Non-Technical',
    color: '#a855f7',
    bg: 'linear-gradient(160deg, rgba(12,4,26,0.95) 0%, rgba(28,8,52,0.92) 100%)',
    border: 'rgba(168,85,247,0.45)',
    glow: 'rgba(168,85,247,0.18)',
    line: '#a855f7',
  },
  {
    num: '03', label: 'Pillar 03', title: 'Self-Development',
    color: '#4facfe',
    bg: 'linear-gradient(160deg, rgba(0,12,28,0.95) 0%, rgba(0,24,46,0.92) 100%)',
    border: 'rgba(79,172,254,0.45)',
    glow: 'rgba(79,172,254,0.18)',
    line: '#4facfe',
  },
  {
    num: '04', label: 'Pillar 04', title: 'Extra-Curricular',
    color: '#ec4899',
    bg: 'linear-gradient(160deg, rgba(18,4,22,0.95) 0%, rgba(36,4,44,0.92) 100%)',
    border: 'rgba(236,72,153,0.45)',
    glow: 'rgba(236,72,153,0.18)',
    line: '#ec4899',
  },
];

const FACE_TRANSFORMS = [
  'rotateY(0deg)   translateZ(80px)',
  'rotateY(90deg)  translateZ(80px)',
  'rotateY(180deg) translateZ(80px)',
  'rotateY(-90deg) translateZ(80px)',
];

export default function AboutSection({ sectionRef }) {
  const containerRef = useRef(null);
  const [rot, setRot] = useState({ x: -6, y: -15 });
  const activeFace = ((Math.round(-rot.y / 90) % 4) + 4) % 4;

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const yRatio = (e.clientY - rect.top) / rect.height;
    const newRotY = -(yRatio * 270);
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const newRotX = xRatio * 18 - 6;
    setRot({ x: newRotX, y: newRotY });
  }, []);

  return (
    <section
      id="about"
      className="section-container"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{ padding: '80px 0', background: 'rgba(10,20,38,0.2)' }}
    >
      <div className="section-content">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '80px',
          alignItems: 'center',
        }}>

          {/* ── Left: robot placeholder — DO NOT REMOVE ── */}
          <div className="about-robot-placeholder" style={{ minHeight: '350px' }} />

          {/* ── Right: content ── */}
          <div ref={containerRef} style={{ userSelect: 'none' }}>

            {/* Cursive heading */}
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '2.4rem',
              fontWeight: '800',
              lineHeight: '1.2',
              background: 'linear-gradient(135deg,#ffffff 30%,#93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '14px',
            }}>
              About our platform
            </h2>

            <p style={{
              fontSize: '0.98rem',
              color: 'var(--text-muted)',
              lineHeight: '1.7',
              marginBottom: '36px',
              maxWidth: '440px',
            }}>
              The <strong style={{ color: '#fff' }}>Learning &amp; Leadership Center</strong> is
              Fr.&nbsp;CRCE's dedicated academic portal — bringing courses, assignments, mentorship,
              and progress tracking into one immersive digital environment.
              Built to bridge classroom theory with real-world readiness.
            </p>

            {/* Academic Pillars heading */}
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '20px',
            }}>
              Academic Pillars
            </h3>

            {/* Cube + list */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>

              {/* ── 3-D cube ── */}
              <div style={{ perspective: '700px', flexShrink: 0 }}>
                <div style={{
                  width: '160px',
                  height: '160px',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
                  transition: 'transform 0.07s linear',
                }}>

                  {/* Four pillar faces */}
                  {PILLARS.map((p, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '12px',
                      background: p.bg,
                      border: `1px solid ${p.border}`,
                      boxShadow: `inset 0 0 24px ${p.glow}, 0 0 0 1px rgba(255,255,255,0.03)`,
                      backfaceVisibility: 'hidden',
                      transform: FACE_TRANSFORMS[i],
                      overflow: 'hidden',
                    }}>
                      {/* Top accent line */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: '20%', right: '20%',
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${p.line}, transparent)`,
                        borderRadius: '0 0 4px 4px',
                      }} />

                      {/* Large accent number */}
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.8rem',
                        fontWeight: '800',
                        lineHeight: '1',
                        color: p.color,
                        opacity: 0.25,
                        position: 'absolute',
                        bottom: '8px',
                        right: '12px',
                        letterSpacing: '-0.04em',
                      }}>{p.num}</div>

                      {/* Label */}
                      <div style={{
                        fontSize: '0.52rem',
                        color: p.color,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '2px',
                      }}>{p.label}</div>

                      {/* Title */}
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        textAlign: 'center',
                        padding: '0 12px',
                        lineHeight: '1.25',
                        textShadow: `0 0 16px ${p.glow}`,
                      }}>{p.title}</div>

                      {/* Bottom accent line */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: '30%', right: '30%',
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${p.line}66, transparent)`,
                      }} />
                    </div>
                  ))}

                  {/* Top cap */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    transform: 'rotateX(90deg) translateZ(80px)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg,rgba(0,242,254,0.04),rgba(127,0,255,0.04))',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }} />
                  {/* Bottom cap */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    transform: 'rotateX(-90deg) translateZ(80px)',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.02)',
                  }} />
                </div>
              </div>

              {/* ── Pillar list ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {PILLARS.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: activeFace === i
                      ? `linear-gradient(135deg, ${p.glow}, rgba(255,255,255,0.03))`
                      : 'transparent',
                    border: `1px solid ${activeFace === i ? p.border : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.3s ease',
                    transform: activeFace === i ? 'translateX(4px)' : 'none',
                    boxShadow: activeFace === i ? `0 0 12px ${p.glow}` : 'none',
                  }}>
                    {/* Colour pip */}
                    <div style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: p.color,
                      boxShadow: activeFace === i ? `0 0 8px ${p.color}` : 'none',
                      transition: 'box-shadow 0.3s ease',
                    }} />
                    <div>
                      <div style={{ fontSize: '0.52rem', color: p.color, fontFamily: 'var(--font-heading)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', lineHeight: '1' }}>{p.label}</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: '700', color: activeFace === i ? '#fff' : 'var(--text-muted)', lineHeight: '1.4' }}>{p.title}</div>
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: '0.68rem', color: 'rgba(138,153,173,0.4)', marginTop: '6px', fontStyle: 'italic' }}>
                  Move cursor up &amp; down to explore
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
