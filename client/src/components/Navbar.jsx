import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ 
  currentView, 
  onViewChange, 
  onLoginClick, 
  activeWorkspaceId, 
  onLogout,
  onScrollToSection
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pillStyle, setPillStyle] = useState({ opacity: 0, transform: 'scale(0.9)' });
  
  const navLinksRef = useRef(null);
  const itemsRef = useRef({});

  // Helper to position the hover pill over the active/hovered element
  const setPillPosition = (element) => {
    if (!element || !navLinksRef.current) {
      setPillStyle({ opacity: 0, transform: 'scale(0.9)' });
      return;
    }
    const containerRect = navLinksRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const relativeLeft = elementRect.left - containerRect.left;
    const relativeTop = elementRect.top - containerRect.top;

    setPillStyle({
      left: `${relativeLeft}px`,
      top: `${relativeTop}px`,
      width: `${elementRect.width}px`,
      height: `${elementRect.height}px`,
      opacity: 1,
      transform: 'scale(1)',
    });
  };

  // Update pill position when currentView changes or on window resize
  useEffect(() => {
    const updatePill = () => {
      if (window.innerWidth > 768) {
        const activeElement = itemsRef.current[currentView];
        if (activeElement) {
          setPillPosition(activeElement);
        } else {
          setPillStyle({ opacity: 0, transform: 'scale(0.9)' });
        }
      } else {
        setPillStyle({ opacity: 0, transform: 'scale(0.9)' });
      }
    };

    const timer = setTimeout(updatePill, 200);

    window.addEventListener('resize', updatePill);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePill);
    };
  }, [currentView]);

  const handleMouseEnter = (viewName) => {
    if (window.innerWidth > 768) {
      const element = itemsRef.current[viewName];
      if (element) {
        setPillPosition(element);
      }
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      const activeElement = itemsRef.current[currentView];
      if (activeElement) {
        setPillPosition(activeElement);
      } else {
        setPillStyle({ opacity: 0, transform: 'scale(0.9)' });
      }
    }
  };

  const handleItemClick = (viewName) => {
    onViewChange(viewName);
    setIsMobileOpen(false);
    if (viewName === 'home' || viewName === 'about' || viewName === 'contact') {
      if (onScrollToSection) onScrollToSection(viewName);
    }
  };

  const isLoggedIn = currentView === 'dashboard' || currentView === 'catalog' || currentView === 'workspace';

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <div className="nav-logo" onClick={() => handleItemClick('home')}>
          <span className="logo-glow"></span>
          <span className="logo-text">EDUSPHERE</span>
        </div>

        <ul 
          ref={navLinksRef} 
          className={`nav-links ${isMobileOpen ? 'active' : ''}`}
          onMouseLeave={handleMouseLeave}
        >
          <div className="nav-hover-pill" style={pillStyle}></div>
          
          {!isLoggedIn && (
            <>
              <li>
                <a 
                  href="#home" 
                  ref={el => itemsRef.current['home'] = el}
                  className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter('home')}
                  onClick={(e) => { e.preventDefault(); handleItemClick('home'); }}
                >
                  Home
                </a>
              </li>

              <li>
                <a 
                  href="#about" 
                  ref={el => itemsRef.current['about'] = el}
                  className={`nav-item ${currentView === 'about' ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter('about')}
                  onClick={(e) => { e.preventDefault(); handleItemClick('about'); }}
                >
                  About
                </a>
              </li>

              <li>
                <a 
                  href="#contact" 
                  ref={el => itemsRef.current['contact'] = el}
                  className={`nav-item ${currentView === 'contact' ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter('contact')}
                  onClick={(e) => { e.preventDefault(); handleItemClick('contact'); }}
                >
                  Contact
                </a>
              </li>
            </>
          )}

          {isLoggedIn && (
            <>
              <li>
                <a 
                  href="#dashboard" 
                  ref={el => itemsRef.current['dashboard'] = el}
                  className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter('dashboard')}
                  onClick={(e) => { e.preventDefault(); handleItemClick('dashboard'); }}
                >
                  Dashboard
                </a>
              </li>

              <li>
                <a 
                  href="#catalog" 
                  ref={el => itemsRef.current['catalog'] = el}
                  className={`nav-item ${currentView === 'catalog' ? 'active' : ''}`}
                  onMouseEnter={() => handleMouseEnter('catalog')}
                  onClick={(e) => { e.preventDefault(); handleItemClick('catalog'); }}
                >
                  Catalog
                </a>
              </li>

              {activeWorkspaceId && (
                <li>
                  <a 
                    href="#workspace" 
                    ref={el => itemsRef.current['workspace'] = el}
                    className={`nav-item ${currentView === 'workspace' ? 'active' : ''}`}
                    onMouseEnter={() => handleMouseEnter('workspace')}
                    onClick={(e) => { e.preventDefault(); handleItemClick('workspace'); }}
                  >
                    Classroom
                  </a>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="nav-auth">
          {isLoggedIn ? (
            <button 
              className="login-btn"
              onClick={() => {
                onLogout();
                handleItemClick('home');
              }}
            >
              Logout
            </button>
          ) : (
            <a 
              href="#login" 
              className="login-btn"
              onClick={(e) => {
                e.preventDefault();
                onLoginClick();
              }}
            >
              Login
            </a>
          )}
        </div>

        <button 
          className={`nav-toggle ${isMobileOpen ? 'active' : ''}`} 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </nav>
    </header>
  );
}
