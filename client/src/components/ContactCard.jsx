import React, { useState } from 'react';

export default function ContactCard({ visible, onMouseEnter, onMouseLeave }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sent'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) return;

    setStatus('sent');
    setEmail('');
    setMessage('');

    // Revert submit button after 3.5 seconds
    setTimeout(() => {
      setStatus('idle');
    }, 3500);
  };

  return (
    <div 
      id="contact-card-container" 
      className={`robot-card contact-card ${visible ? 'visible' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="robot-card-header">
        <span className="pulse-indicator pulse-purple"></span>
        <span>CONNECT WITH US</span>
      </div>
      <div className="robot-card-body">
        <p className="contact-desc">Let's craft something epic together. Drop your message below and we'll reply shortly:</p>
        <form id="contact-quick-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              className="quick-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sent'}
            />
          </div>
          <div className="form-group">
            <textarea 
              placeholder="Your Message" 
              required 
              className="quick-textarea" 
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === 'sent'}
            ></textarea>
          </div>
          <button 
            type="submit" 
            className={`quick-submit-btn ${status === 'sent' ? 'sent' : ''}`}
            id="quick-submit-btn"
            disabled={status === 'sent'}
          >
            {status === 'sent' ? 'Message Sent!' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
