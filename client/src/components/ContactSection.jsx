import React, { useState } from 'react';

export default function ContactSection({ sectionRef }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sent'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) return;

    setStatus('sent');
    setEmail('');
    setMessage('');

    setTimeout(() => {
      setStatus('idle');
    }, 3500);
  };

  return (
    <section id="contact" className="section-container" ref={sectionRef} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="section-content">
        <div className="about-section-grid fade-in-card" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
          
          {/* Form Details (Left Grid Side) */}
          <div className="login-form-side" style={{ padding: '0px' }}>
            <div className="login-header">
              <h2 className="login-title" style={{ background: 'linear-gradient(135deg, #ffffff, var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', marginBottom: '15px' }}>Registrar Help Desk</h2>
              <p className="login-subtitle" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                Have questions about course credits, registration limits, or curriculum prerequisites? Send a message to our registrar team:
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} style={{ gap: '20px' }}>
              <div className="login-input-group">
                <label className="login-label">Student Email Address</label>
                <input 
                  type="email" 
                  className="login-input" 
                  placeholder="student@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'sent'}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}
                />
              </div>

              <div className="login-input-group">
                <label className="login-label">Inquiry Message</label>
                <textarea 
                  placeholder="Describe your registration issue or schedule questions..."
                  required 
                  className="login-input" 
                  style={{ resize: 'none', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}
                  rows="6"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === 'sent'}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`login-submit-btn ${status === 'sent' ? 'success' : ''}`}
                style={status !== 'sent' ? { background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))', boxShadow: '0 4px 15px rgba(127, 0, 255, 0.15)', borderRadius: '10px', padding: '14px' } : { borderRadius: '10px', padding: '14px' }}
                disabled={status === 'sent'}
              >
                {status === 'sent' ? 'Message Sent to Registrar!' : 'Submit Inquiry'}
              </button>
            </form>
          </div>

          {/* Right Column left empty so the global scrolling robot moves into this space */}
          <div className="contact-robot-placeholder" style={{ minHeight: '300px' }}></div>

        </div>
      </div>
    </section>
  );
}
