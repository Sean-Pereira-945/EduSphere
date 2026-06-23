import React from 'react';

export default function AboutSection({ sectionRef }) {
  return (
    <section id="about" className="section-container" ref={sectionRef} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="section-content">
        {/* Swapped layout: Robot placeholder on the Left (1fr), Text on the Right (1.2fr) */}
        <div className="about-section-grid fade-in-card" style={{ gridTemplateColumns: '1fr 1.2fr', gap: '50px' }}>
          
          {/* Left Column left empty for the global scrolling robot */}
          <div className="about-robot-placeholder" style={{ minHeight: '300px' }}></div>

          {/* Descriptive copy on right side */}
          <div className="about-text-side">
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Next-Generation Academic Hub
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '20px' }}>
              Welcome to <strong>EduSphere</strong>, a modern virtual classroom and course management system 
              built for the next generation of college students. We combine responsive, glassmorphic dashboards 
              with interactive lecture interfaces to make planning and learning highly intuitive.
            </p>
            <div className="about-features" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="feature-item">
                <span className="feature-icon-bullet" style={{ background: 'var(--accent-cyan)' }}></span>
                <span><strong>Classroom Planner</strong>: Dynamic weekly schedules synchronized automatically as you enroll.</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon-bullet" style={{ background: 'var(--accent-cyan)' }}></span>
                <span><strong>Concept Assessments</strong>: Slide reading materials paired with concept checking quizzes.</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon-bullet" style={{ background: 'var(--accent-cyan)' }}></span>
                <span><strong>Registrar Portal</strong>: Interactive course explorer with real-time seat tracking and credit validation.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
