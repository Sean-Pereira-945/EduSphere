import React, { useState } from 'react';

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
            {course.name}
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

function CircularProgressCourseCard({ course, studentProfile, status, onDrop, onNavigateToWorkspace, onViewSyllabus }) {
  const [hovered, setHovered] = useState(false);

  const completedModules = studentProfile.completedModules.filter(mId => 
    mId.startsWith(course.id) || mId.includes(course.id)
  );
  const totalModules = 4;
  const progressPercent = Math.min(Math.round((completedModules.length / totalModules) * 100), 100);

  return (
    <div 
      className="google-classroom-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(10, 20, 38, 0.5)',
        border: hovered ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 15px 30px rgba(0, 0, 0, 0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Course Banner Image */}
      <div style={{
        height: '140px',
        width: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        overflow: 'hidden'
      }}>
        {course.logo ? (
          <img 
            src={course.logo} 
            alt={course.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 'bold',
            opacity: 0.8
          }}>
            {course.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <span style={{
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--accent-cyan)',
            fontWeight: '700',
            background: 'rgba(6, 182, 212, 0.08)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            {course.department}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginTop: '10px', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            {course.name}
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {course.professor} &bull; {course.schedule}
          </div>
        </div>

        {/* Progress Bar or Pending Badge */}
        {status === 'pending' ? (
          <div style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            color: '#fef08a',
            fontSize: '0.75rem',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '0.05em'
          }}>
            PENDING APPROVAL
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Action Buttons Row - EXACTLY THREE BUTTONS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.2fr 0.8fr',
          gap: '10px',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '15px'
        }}>
          {status === 'pending' ? (
            <button 
              disabled 
              className="login-btn"
              style={{ padding: '8px 4px', fontSize: '0.75rem', opacity: 0.5, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              Open Course
            </button>
          ) : (
            <button 
              className="login-btn"
              onClick={() => onNavigateToWorkspace(course.id)}
              style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              Open Course
            </button>
          )}

          <button 
            className="filter-pill"
            onClick={() => onViewSyllabus(course)}
            style={{ padding: '8px 4px', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            View Syllabus
          </button>

          <button 
            onClick={() => onDrop(course.id)}
            style={{ 
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'none',
              padding: '8px 0',
              textAlign: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            {status === 'pending' ? 'Cancel' : 'Unenroll'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ 
  studentProfile, 
  courses, 
  enrolledIds, 
  enrollmentStatuses = {},
  onNavigateToWorkspace, 
  onNavigateToCatalog,
  onEnroll,
  onDrop
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSyllabusCourse, setSelectedSyllabusCourse] = useState(null);

  const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id));
  const discoverCourses = courses.filter(c => !enrolledIds.includes(c.id));
  
  const filteredDiscover = selectedCategory === 'all' 
    ? discoverCourses 
    : discoverCourses.filter(c => c.department === selectedCategory);

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

      {/* My Courses (Enrolled Courses Grid) */}
      <div className="edusphere-card" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>
          My Learning
        </h2>
        {enrolledCourses.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {enrolledCourses.map(course => (
              <CircularProgressCourseCard 
                key={course.id} 
                course={course} 
                studentProfile={studentProfile} 
                status={enrollmentStatuses[course.id]}
                onDrop={onDrop} 
                onNavigateToWorkspace={onNavigateToWorkspace}
                onViewSyllabus={setSelectedSyllabusCourse}
              />
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  {course.logo ? (
                    <img src={course.logo} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                      {course.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)}
                    </div>
                  )}
                </div>
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

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => onEnroll(course.id)}
                    disabled={course.seatsAvailable <= 0}
                    className="login-btn"
                    style={{
                      flexGrow: 1,
                      background: course.seatsAvailable > 0 ? '' : 'rgba(255,255,255,0.05)',
                      color: course.seatsAvailable > 0 ? '' : 'var(--text-muted)',
                      cursor: course.seatsAvailable > 0 ? 'pointer' : 'not-allowed',
                      borderColor: course.seatsAvailable > 0 ? '' : 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {course.seatsAvailable > 0 ? 'Enroll in Track' : 'Class is Full'}
                  </button>
                  <button 
                    className="filter-pill"
                    onClick={() => setSelectedSyllabusCourse(course)}
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    Syllabus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>
            No other matching courses found under this category.
          </div>
        )}
      </div>

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
