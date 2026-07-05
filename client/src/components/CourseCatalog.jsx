import React, { useState, useEffect } from 'react';

function SyllabusModal({ course, onClose }) {
  const [zoomScale, setZoomScale] = useState(1);

  if (!course) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="edusphere-card" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        background: '#060913',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {course.name} Syllabus
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.8rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Controls row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="filter-pill"
              onClick={() => setZoomScale(prev => Math.min(prev + 0.1, 2.5))}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Zoom In
            </button>
            <button 
              className="filter-pill"
              onClick={() => setZoomScale(prev => Math.max(prev - 0.1, 0.5))}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Zoom Out
            </button>
            <button 
              className="filter-pill"
              onClick={() => setZoomScale(1)}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Reset
            </button>
          </div>
          <button 
            className="login-btn"
            onClick={() => window.open(course.syllabus, '_blank')}
            style={{ padding: '6px 16px', fontSize: '0.75rem' }}
          >
            Download
          </button>
        </div>

        {/* Syllabus Frame/View */}
        <div style={{
          flexGrow: 1,
          padding: '30px',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {course.syllabus ? (
              course.syllabus.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={course.syllabus} 
                  title="Syllabus PDF" 
                  style={{ width: '100%', height: '500px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: '#fff' }} 
                />
              ) : (
                <img 
                  src={course.syllabus} 
                  alt="Syllabus" 
                  style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }} 
                />
              )
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Syllabus image not loaded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  courses: propCourses = [], 
  enrolledIds, 
  enrollmentStatuses = {},
  onEnroll, 
  onDrop, 
  creditsLimit, 
  currentCredits,
  userType: propUserType,
  onNavigateToWorkspace
}) {
  // Resolve userType from prop or localStorage (handles stale prop on first render)
  const userType = propUserType || localStorage.getItem('userType') || 'student';
  const isTeacher = userType === 'teacher';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSyllabusCourse, setSelectedSyllabusCourse] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loadingTeacher, setLoadingTeacher] = useState(isTeacher);

  // If teacher: self-fetch courses directly (don't depend on parent's async state)
  useEffect(() => {
    if (!isTeacher) return;
    const token = localStorage.getItem('token');
    if (!token) { setLoadingTeacher(false); return; }

    setLoadingTeacher(true);
    fetch('/api/courses/teacher', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const mapped = data.courses.map(c => ({
            id: String(c._id),
            code: `${c.category || 'COURSE'}-${c._id}`,
            name: c.name,
            department: c.category || 'General',
            professor: c.teacher ? c.teacher.name : 'Staff',
            instructor: c.teacher ? c.teacher.name : 'Staff',
            schedule: c.schedule || 'TBA',
            seatsAvailable: c.capacity - ((c.students || []).length),
            totalSeats: c.capacity || 30,
            description: c.description || '',
            syllabus: c.syllabusPath || '',
            logo: c.logo || '',
            enrolledCount: (c.students || []).length,
          }));
          setTeacherCourses(mapped);
        }
      })
      .catch(err => console.error('Teacher catalog fetch error:', err))
      .finally(() => setLoadingTeacher(false));
  }, [isTeacher]);

  // Use self-fetched courses for teacher, prop courses for student
  const courses = isTeacher ? teacherCourses : propCourses;

  const departments = ['ALL', 'Technical', 'Non-technical', 'Self-Development', 'Extra-curricular'];

  const filteredCourses = courses.filter(course => {
    const instructor = (course.professor || course.instructor || '').toLowerCase();
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (course.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          instructor.includes(searchTerm.toLowerCase()) ||
                          (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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
          {userType === 'teacher' ? (
            <>
              <h1>My Courses</h1>
              <p>All courses you are currently teaching. Click a course to open its workspace.</p>
            </>
          ) : (
            <>
              <h1>Course Explorer</h1>
              <p>Browse and enroll in courses for the Fall semester.</p>
            </>
          )}
        </div>
        {userType !== 'teacher' && (
          <div className="edusphere-card" style={{ padding: '10px 20px', borderRadius: '50px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Credits Allocated: <strong style={{ color: '#fff' }}>{currentCredits}</strong> / {creditsLimit}
            </span>
          </div>
        )}
        {userType === 'teacher' && (
          <div className="edusphere-card" style={{ padding: '10px 20px', borderRadius: '50px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Courses: <strong style={{ color: 'var(--accent-cyan)' }}>{courses.length}</strong>
            </span>
          </div>
        )}
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
      {loadingTeacher ? (
        <div className="edusphere-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid rgba(0,242,254,0.12)', borderTop: '3px solid var(--accent-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledIds.includes(course.id);
            const isFull = course.seatsAvailable <= 0;
            const isTeacher = userType === 'teacher';

            return (
              <div key={course.id} className="edusphere-card course-card">
                <div className="course-card-top">
                  <ImageWithFallback src={course.logo} alt={course.name} height="140px" />
                  <div className="course-tag-row">
                    <span className={`dept-tag ${getDeptClass(course.department)}`}>
                      {course.department}
                    </span>
                    <span className="credits-badge">
                      {isTeacher ? `${course.enrolledCount ?? 0} students` : `${course.credits} Credits`}
                    </span>
                  </div>
                  <h3 className="course-card-title">{course.name}</h3>
                  <div className="course-card-code">{course.code}</div>
                  <p className="course-card-desc">{course.description}</p>
                </div>

                <div className="course-info-list">
                  <div className="course-info-item">
                    <span>{isTeacher ? 'Category' : 'Instructor'}</span>
                    <strong>{isTeacher ? (course.department || 'General') : (course.professor || course.instructor || 'Professor Staff')}</strong>
                  </div>
                  <div className="course-info-item">
                    <span>Schedule</span>
                    <strong>{course.schedule || 'TBA'}</strong>
                  </div>
                  <div className="course-info-item">
                    {isTeacher ? (
                      <>
                        <span>Capacity</span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          {course.enrolledCount ?? 0} / {course.totalSeats} enrolled
                        </strong>
                      </>
                    ) : (
                      <>
                        <span>Seats Available</span>
                        <strong style={{ color: isFull ? '#ef4444' : '#22c55e' }}>
                          {course.seatsAvailable} / {course.totalSeats}
                        </strong>
                      </>
                    )}
                  </div>

                  {/* View Syllabus Button */}
                  <button 
                    className="enroll-btn"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderColor: 'rgba(0, 242, 254, 0.3)', 
                      color: 'var(--accent-cyan)',
                      marginTop: '15px'
                    }}
                    onClick={() => setSelectedSyllabusCourse(course)}
                  >
                    View Syllabus
                  </button>

                  {/* Action button — role-aware */}
                  {isTeacher ? (
                    <button
                      className="enroll-btn action-enroll"
                      style={{ marginTop: '10px' }}
                      onClick={() => onNavigateToWorkspace && onNavigateToWorkspace(course.id)}
                    >
                      Open Course →
                    </button>
                  ) : isEnrolled ? (
                    <button 
                      className="enroll-btn action-drop"
                      style={{ marginTop: '10px' }}
                      onClick={() => onDrop(course.id)}
                    >
                      {enrollmentStatuses[course.id] === 'pending' ? 'Cancel Request' : 'Drop Course'}
                    </button>
                  ) : (
                    <button 
                      className={`enroll-btn ${isFull ? 'action-disabled' : 'action-enroll'}`}
                      disabled={isFull}
                      onClick={() => onEnroll(course.id)}
                      style={{ marginTop: '10px' }}
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
          {userType === 'teacher' ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
              <h3 style={{ marginBottom: '10px', color: '#fff' }}>No courses yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Head to your <strong style={{ color: 'var(--accent-cyan)' }}>Teacher Dashboard</strong> to create your first course.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: '10px' }}>No courses match your query</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try resetting the subject filter or typing a different keyword.</p>
            </>
          )}
        </div>
      )}

      {/* Syllabus Modal */}
      {selectedSyllabusCourse && (
        <SyllabusModal 
          course={selectedSyllabusCourse} 
          onClose={() => setSelectedSyllabusCourse(null)} 
        />
      )}
    </div>
  );
}
