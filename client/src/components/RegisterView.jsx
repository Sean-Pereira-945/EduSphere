import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function RegisterView({ onBackToHome, onSignInClick }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student'); // 'student' | 'teacher'
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setStatus('submitting');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, userType })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        onSignInClick(); // Redirect to login
      }, 1500);
    } catch (err) {
      setStatus('idle');
      setErrorMsg(err.message || 'Connection to registration server failed');
    }
  };

  return (
    <div className="login-view-container" style={{ overflowY: 'auto', padding: '100px 20px 40px 20px' }}>
      {/* Floating Borderless Grid Layout (Directly on page background, no bounding card) */}
      <div style={{
        width: '95%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '40px',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }}>
        
        {/* Column 1: Brand Panel & Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '3.2rem', 
              fontWeight: '800', 
              lineHeight: '1.1',
              background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '15px'
            }}>
              Join EduSphere.
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Create an account to gain access to structured dashboards, role-based workflows, and fast course enrollment modules.
            </p>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Full 3D Campus Dashboard
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Syllabus & Material Access
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Weekly Schedule Timeline
            </li>
          </ul>

          <a className="back-home-link" onClick={onBackToHome} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--accent-cyan)', textDecoration: 'none', transition: 'opacity 0.2s' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
        </div>

        {/* Column 2: Register Form Side */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="login-header" style={{ marginBottom: '20px' }}>
            <h2 className="login-title" style={{ fontSize: '2rem' }}>Sign up</h2>
            <p className="login-subtitle">Choose your user profile role to begin.</p>
          </div>

          <form className="login-form" onSubmit={handleRegister}>
            {errorMsg && (
              <div style={{ 
                color: '#ff4e50', 
                fontSize: '0.85rem', 
                fontWeight: 500, 
                background: 'rgba(255, 78, 80, 0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '15px', 
                border: '1px solid rgba(255, 78, 80, 0.2)' 
              }}>
                {errorMsg}
              </div>
            )}

            {/* Role Selection tab */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setUserType('student')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: userType === 'student' ? 'var(--accent-cyan)' : 'transparent',
                  color: userType === 'student' ? '#0f172a' : 'var(--text-muted)'
                }}
              >
                I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setUserType('teacher')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: userType === 'teacher' ? 'var(--accent-cyan)' : 'transparent',
                  color: userType === 'teacher' ? '#0f172a' : 'var(--text-muted)'
                }}
              >
                I'm a Teacher
              </button>
            </div>

            <div className="login-input-group">
              <label className="login-label">Full Name</label>
              <input 
                type="text" 
                className="login-input" 
                placeholder="Alex Mercer"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="login-input-group">
              <label className="login-label">Email Address</label>
              <input 
                type="email" 
                className="login-input" 
                placeholder="name@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input 
                type="password" 
                className="login-input" 
                placeholder="Min. 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status !== 'idle'}
              />
            </div>

            <div className="login-input-group">
              <label className="login-label">Confirm Password</label>
              <input 
                type="password" 
                className="login-input" 
                placeholder="Re-enter password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={status !== 'idle'}
              />
            </div>

            <button 
              type="submit" 
              className={`login-submit-btn ${status === 'submitting' ? 'submitting' : ''} ${status === 'success' ? 'success' : ''}`}
              disabled={status !== 'idle'}
              style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
                border: 'none',
                borderRadius: '8px',
                color: '#0f172a',
                fontWeight: '700',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginTop: '10px'
              }}
            >
              {status === 'idle' && 'Sign Up'}
              {status === 'submitting' && 'Registering...'}
              {status === 'success' && 'Account Created!'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Already registered?{' '}
            <a href="#login" className="forgot-pass" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSignInClick(); }}>
              Sign In to your Account
            </a>
          </div>
        </div>

        {/* Column 3: Floating 3D Spline Robot */}
        <div style={{ height: '480px', position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div style={{ 
            pointerEvents: 'auto', 
            width: 'calc(100% + 200px)', 
            height: 'calc(100% + 150px)', 
            position: 'absolute',
            left: '-100px',
            top: '0px'
          }}>
            <Spline 
              scene="https://prod.spline.design/LKjeLC9tL0AVGvJf/scene.splinecode" 
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
