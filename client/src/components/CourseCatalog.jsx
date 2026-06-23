import React, { useState } from 'react';

function ImageWithFallback({ src, alt, height = '120px' }) {
  const [error, setError] = useState(!src);
  
  if (error) {
    const initials = alt
      ? alt.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
      : 'EDU';
      
    return (
      <div style={{ 
        width: '100%', 
        height, 
        borderRadius: '12px', 
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-cyan)',
        fontFamily: 'var(--font-heading)',
        fontSize: '1.8rem',
        fontWeight: '800',
        textShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
        letterSpacing: '0.05em',
        marginBottom: '15px'
      }}>
        {initials}
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <img 
        src={src} 
        alt={alt} 
        onError={() => setError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    </div>
  );
}

export default function CourseCatalog({ 
  courses, 
  enrolledIds, 
  onEnroll, 
  onDrop, 
  creditsLimit, 
  currentCredits 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = ['ALL', 'Technical', 'Non-technical', 'Self-Development', 'Extra-curricular'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || course.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const getDeptClass = (dept) => {
    switch (dept) {
      case 'Technical': return 'cs';
      case 'Non-technical': return 'math';
      case 'Self-Development': return 'phys';
      case 'Extra-curricular': return 'lit';
      default: return '';
    }
  };

  return (
    <div className="edusphere-view-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Course Explorer</h1>
          <p>Browse and enroll in high-end courses for the Fall 2026 semester.</p>
        </div>
        <div className="edusphere-card" style={{ padding: '10px 20px', borderRadius: '50px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Credits Allocated: <strong style={{ color: '#fff' }}>{currentCredits}</strong> / {creditsLimit}
          </span>
        </div>
      </div>

      {/* Catalog Search and Filters */}
      <div className="catalog-controls">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Search by code, title, or professor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-pills-row">
          {departments.map(dept => (
            <button 
              key={dept} 
              className={`filter-pill ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept === 'ALL' ? 'All Subjects' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Courses */}
      {filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledIds.includes(course.id);
            const isFull = course.seatsAvailable <= 0;

            return (
              <div key={course.id} className="edusphere-card course-card">
                <div className="course-card-top">
                  <ImageWithFallback src={course.logo} alt={course.name} height="140px" />
                  <div className="course-tag-row">
                    <span className={`dept-tag ${getDeptClass(course.department)}`}>
                      {course.department}
                    </span>
                    <span className="credits-badge">{course.credits} Credits</span>
                  </div>
                  <h3 className="course-card-title">{course.name}</h3>
                  <div className="course-card-code">{course.code}</div>
                  <p className="course-card-desc">{course.description}</p>
                </div>

                <div className="course-info-list">
                  <div className="course-info-item">
                    <span>Instructor</span>
                    <strong>{course.instructor}</strong>
                  </div>
                  <div className="course-info-item">
                    <span>Schedule</span>
                    <strong>{course.timing}</strong>
                  </div>
                  <div className="course-info-item">
                    <span>Seats Available</span>
                    <strong style={{ color: isFull ? '#ef4444' : '#22c55e' }}>
                      {course.seatsAvailable} / {course.totalSeats}
                    </strong>
                  </div>

                  {isEnrolled ? (
                    <button 
                      className="enroll-btn action-drop"
                      onClick={() => onDrop(course.id)}
                    >
                      Drop Course
                    </button>
                  ) : (
                    <button 
                      className={`enroll-btn ${isFull ? 'action-disabled' : 'action-enroll'}`}
                      disabled={isFull}
                      onClick={() => onEnroll(course.id)}
                    >
                      {isFull ? 'Class Full' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="edusphere-card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ marginBottom: '10px' }}>No courses match your query</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try resetting the subject filter or typing a different keyword.</p>
        </div>
      )}
    </div>
  );
}
