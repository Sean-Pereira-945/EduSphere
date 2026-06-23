import React, { useState } from 'react';

export default function Dashboard({ 
  studentProfile, 
  courses, 
  enrolledIds, 
  onNavigateToWorkspace, 
  onNavigateToCatalog,
  onEnroll,
  onDrop
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id));
  const discoverCourses = courses.filter(c => !enrolledIds.includes(c.id));
  
  // Filter courses by category if needed
  const filteredDiscover = selectedCategory === 'all' 
    ? discoverCourses 
    : discoverCourses.filter(c => c.department === selectedCategory);

  // Stats calculation
  const activeCoursesCount = enrolledCourses.length;
  const openSeatsTotal = courses.reduce((sum, c) => sum + (c.seatsAvailable || 0), 0);

  return (
    <div className="edusphere-view-container">
      
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '35px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Course Activity
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Your weekly learning cockpit
          </p>
        </div>
        <button 
          className="login-btn" 
          onClick={onNavigateToCatalog}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Discover New Programs
        </button>
      </div>

      {/* Summary Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Active Courses
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '10px' }}>
            {activeCoursesCount}
          </h2>
        </div>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Open in Enrolled
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: 'var(--accent-purple)', marginTop: '10px' }}>
            {activeCoursesCount}
          </h2>
        </div>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Open Seats Total
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: '#f59e0b', marginTop: '10px' }}>
            {openSeatsTotal}
          </h2>
        </div>
      </div>

      {/* My Learning (Enrolled Courses Grid) */}
      <div className="edusphere-card" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>
          My Learning
        </h2>
        {enrolledCourses.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {enrolledCourses.map(course => (
              <div 
                key={course.id} 
                className="enrolled-card-item"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                {course.logo && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={course.logo} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-cyan)',
                    fontWeight: '600'
                  }}>
                    {course.department}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginTop: '4px' }}>{course.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{course.schedule}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prof. {course.professor}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="filter-pill"
                      onClick={() => onDrop(course.id)}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    >
                      Drop
                    </button>
                    <button 
                      className="login-btn"
                      onClick={() => onNavigateToWorkspace(course.id)}
                      style={{ padding: '6px 15px', fontSize: '0.75rem' }}
                    >
                      Enter Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '15px' }}>You are not enrolled in any tracks yet.</p>
            <button className="login-btn" onClick={onNavigateToCatalog}>Browse Courses</button>
          </div>
        )}
      </div>

      {/* Discover Programs Section */}
      <div className="edusphere-card" style={{ padding: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>
          Discover Programs
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Filter by categories and start learning immediately</p>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '30px'
        }}>
          {['all', 'Technical', 'Non-technical', 'Self-Development', 'Extra-curricular'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="filter-pill"
              style={{
                background: selectedCategory === cat ? 'var(--accent-cyan)' : 'transparent',
                color: selectedCategory === cat ? '#0f172a' : 'var(--text-muted)',
                borderColor: selectedCategory === cat ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Discover Catalog Grid */}
        {filteredDiscover.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredDiscover.map(course => (
              <div 
                key={course.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {course.logo && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={course.logo} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    {course.department}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: course.seatsAvailable > 0 ? '#10b981' : '#ef4444' }}>
                    {course.seatsAvailable} / {course.totalSeats} seats left
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>{course.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{course.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0' }}>
                  <div>📅 {course.schedule}</div>
                  <div>🎓 Overseen by Prof. {course.professor}</div>
                </div>

                <button 
                  onClick={() => onEnroll(course.id)}
                  disabled={course.seatsAvailable <= 0}
                  className="login-btn"
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    background: course.seatsAvailable > 0 ? '' : 'rgba(255,255,255,0.05)',
                    color: course.seatsAvailable > 0 ? '' : 'var(--text-muted)',
                    cursor: course.seatsAvailable > 0 ? 'pointer' : 'not-allowed',
                    borderColor: course.seatsAvailable > 0 ? '' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  {course.seatsAvailable > 0 ? 'Enroll in Track' : 'Class is Full'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>
            No other matching courses found under this category.
          </div>
        )}
      </div>

    </div>
  );
}
