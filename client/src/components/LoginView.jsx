import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function LoginView({ onLoginSuccess, onBackToHome, onSignUpClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student'); // 'student' | 'teacher'
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus('submitting');
    setErrorMsg('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, userType })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        onLoginSuccess({
          token: data.token,
          userType: data.userType,
          name: data.name,
          userId: data.userId
        });
      }, 1000);
    } catch (err) {
      setStatus('idle');
      setErrorMsg(err.message || 'Connection to authentication server failed');
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
        
        {/* Column 1: Original Brand & Benefits Panel (Floating Text) */}
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
              Welcome back.
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Continue your course journey with one secure login for students and teachers.
            </p>
          </div>

          {/* Original benefits checklist list styled as futuristic floating points */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Structured dashboards
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Role-based access
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#f1f5f9' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)' 
              }}></span>
              Fast enrollment workflow
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

        {/* Column 2: Sign-in Form Side */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="login-header" style={{ marginBottom: '20px' }}>
            <h2 className="login-title" style={{ fontSize: '2rem' }}>Sign in</h2>
            <p className="login-subtitle">Select your role and continue.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
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

            {/* Original Select Login Role button styles but styled beautifully */}
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
              <label className="login-label">Email</label>
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

            <div className="login-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={status !== 'idle'}
                />
                Remember me
              </label>
              <a href="#forgot" className="forgot-pass" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
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
                transition: 'all 0.3s'
              }}
            >
              {status === 'idle' && 'Login'}
              {status === 'submitting' && 'Connecting...'}
              {status === 'success' && 'Welcome Back!'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No account yet?{' '}
            <a href="#register" className="forgot-pass" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSignUpClick(); }}>
              Create one
            </a>
          </div>
        </div>

        {/* Column 3: Floating 3D Spline Robot (No card wrapper, completely transparent canvas floating) */}
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
