import React from 'react';
import Spline from '@splinetool/react-spline';

export default function CompanionCard({ visible, onMouseEnter, onMouseLeave }) {
  return (
    <div 
      id="about-robot-container" 
      className={`robot-card ${visible ? 'visible' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="robot-card-header">
        <span className="pulse-indicator"></span>
        <span>NEXUS COMPANION</span>
      </div>
      <div className="robot-card-body">
        <div className="robot-bubble">
          <p>Hello! We build high-end interactive 3D websites, Web3 applications, and custom AI experiences. Rotate me to say hi!</p>
        </div>
        <div className="robot-canvas-wrapper">
          <Spline 
            id="canvas3d-about"
            scene="https://prod.spline.design/LKjeLC9tL0AVGvJf/scene.splinecode" 
          />
        </div>
      </div>
    </div>
  );
}
