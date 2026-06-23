import React, { useState, useEffect } from 'react';

export default function CourseWorkspace({ 
  course, 
  studentProfile, 
  onCompleteModule, 
  onBackToDashboard 
}) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizState, setQuizState] = useState('idle'); // 'idle' | 'selected' | 'correct' | 'incorrect'

  // Assignments & Submissions states
  const [activeTab, setActiveTab] = useState('lectures'); // 'lectures' | 'assignments'
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const fetchAssignmentsAndSubmissions = async () => {
    if (!course || !course.id) return;
    try {
      const detailsRes = await fetch(`/api/courses/${course.id}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const detailsData = await detailsRes.json();
      if (detailsData.assignments) {
        setAssignments(detailsData.assignments);
      }

      const subsRes = await fetch(`/api/courses/${course.id}/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const subsData = await subsRes.json();
      if (subsData.success && subsData.submissions) {
        setSubmissions(subsData.submissions);
      }
    } catch (err) {
      console.error("Error fetching classroom assignments/submissions:", err);
    }
  };

  useEffect(() => {
    fetchAssignmentsAndSubmissions();
    setActiveTab('lectures');
  }, [course]);

  const handleFileUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert("Assignment submitted successfully!");
        fetchAssignmentsAndSubmissions();
      } else {
        alert("Submission failed: " + data.message);
      }
    } catch (err) {
      alert("Submission error: " + err.message);
    }
  };

  const activeModule = course?.modules?.[activeModuleIndex];
  const isModuleCompleted = activeModule ? studentProfile.completedModules.includes(activeModule.id) : false;

  // Reset quiz states when changing modules
  useEffect(() => {
    setSelectedOption(null);
    setQuizState('idle');
  }, [activeModuleIndex]);

  if (!course) {
    return (
      <div className="edusphere-view-container" style={{ textAlign: 'center', padding: '100px' }}>
        <h2>No Active Course Selected</h2>
        <button className="login-btn" style={{ marginTop: '20px' }} onClick={onBackToDashboard}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleOptionClick = (index) => {
    if (isModuleCompleted || quizState === 'correct') return;
    setSelectedOption(index);
    setQuizState('selected');
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !activeModule) return;
    const isCorrect = selectedOption === activeModule.quiz.correctIndex;
    
    if (isCorrect) {
      setQuizState('correct');
      onCompleteModule(activeModule.id, 100); // 100 XP award
    } else {
      setQuizState('incorrect');
    }
  };

  // Convert custom markdown representation to simple styled blocks
  const renderSlideContent = (text) => {
    if (!text) return null;
    return text.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Headings
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx}>{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx}>{trimmed.replace('#### ', '')}</h4>;
      }
      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={idx}>
            {trimmed.split('\n').map((li, lIdx) => (
              <li key={lIdx}>{li.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      // Numbered lists
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <ol key={idx}>
            {trimmed.split('\n').map((li, lIdx) => (
              <li key={lIdx}>{li.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }
      // Equations or code blocks
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        return (
          <pre key={idx} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', borderColor: 'var(--accent-purple)' }}>
            <code>{trimmed.replace(/\$\$/g, '')}</code>
          </pre>
        );
      }

      // Default paragraph
      return <p key={idx}>{trimmed}</p>;
    });
  };

  return (
    <div className="edusphere-view-container">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={onBackToDashboard}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
            >
              ←
            </button>
            <h1>{course.code}: {course.name}</h1>
          </div>
          <p style={{ marginLeft: '35px' }}>Classroom workspace overseen by {course.instructor}</p>
        </div>
      </div>

      <div className="workspace-container">
        {/* Left Sidebar: Outline / Modules */}
        <div className="workspace-sidebar">
          <div className="edusphere-card" style={{ flexGrow: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '15px', color: '#fff' }}>
              Lectures & Syllabus
            </h3>
            <div className="module-nav-list">
              {course.modules.map((mod, index) => {
                const isModDone = studentProfile.completedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    className={`module-nav-item ${activeModuleIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveModuleIndex(index)}
                  >
                    <span className="module-status-dot" style={{ backgroundColor: isModDone ? '#22c55e' : '' }}></span>
                    <div style={{ flexGrow: 1 }}>
                      <div>{mod.title}</div>
                      {isModDone && <span style={{ fontSize: '0.65rem', color: '#4ade80' }}>Completed (+100 XP)</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '20px', paddingTop: '15px' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '8px' }}>Course Syllabus:</h4>
              {Array.isArray(course.syllabus) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.syllabus.map((s, idx) => {
                    const isImg = typeof s === 'string' && (s.startsWith('/') || s.startsWith('http') || s.includes('/uploads/'));
                    if (isImg) {
                      return (
                        <div key={idx} style={{ marginTop: '5px' }}>
                          <img src={s} alt="Syllabus" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                          <a 
                            href={s} 
                            download 
                            className="filter-pill" 
                            style={{ display: 'inline-flex', marginTop: '10px', textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem', textAlign: 'center' }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📥 Open Syllabus Image
                          </a>
                        </div>
                      );
                    }
                    return <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {s}</div>;
                  })}
                </div>
              ) : course.syllabus ? (
                <div style={{ marginTop: '10px' }}>
                  <img src={course.syllabus} alt="Course Syllabus" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <a 
                    href={course.syllabus} 
                    download 
                    className="filter-pill" 
                    style={{ display: 'inline-flex', marginTop: '10px', textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem', textAlign: 'center' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📥 Open / Download Syllabus
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No syllabus uploaded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Center: Slide Viewer / Assignments */}
        <div className="edusphere-card workspace-lecture-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', paddingBottom: '12px', gap: '15px' }}>
            <button 
              className={`filter-pill ${activeTab === 'lectures' ? 'active' : ''}`}
              onClick={() => setActiveTab('lectures')}
              style={{
                padding: '8px 20px',
                background: activeTab === 'lectures' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'lectures' ? '#0f172a' : 'var(--text-muted)',
                borderColor: activeTab === 'lectures' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              📖 Slide Lectures
            </button>
            <button 
              className={`filter-pill ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
              style={{
                padding: '8px 20px',
                background: activeTab === 'assignments' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'assignments' ? '#ffffff' : 'var(--text-muted)',
                borderColor: activeTab === 'assignments' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              📝 Assignments ({assignments.length})
            </button>
          </div>

          {activeTab === 'lectures' ? (
            <>
              <div className="lecture-viewer-body" style={{ flexGrow: 1 }}>
                {activeModule ? (
                  renderSlideContent(activeModule.content)
                ) : (
                  <p>No content available for this module.</p>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px', marginTop: '20px' }}>
                <button
                  className="filter-pill"
                  disabled={activeModuleIndex === 0}
                  onClick={() => setActiveModuleIndex(prev => prev - 1)}
                  style={{ opacity: activeModuleIndex === 0 ? 0.3 : 1, cursor: activeModuleIndex === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Previous Module
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  Module {activeModuleIndex + 1} of {course.modules ? course.modules.length : 1}
                </span>
                <button
                  className="filter-pill"
                  disabled={course.modules ? activeModuleIndex === course.modules.length - 1 : true}
                  onClick={() => setActiveModuleIndex(prev => prev + 1)}
                  style={{ opacity: (course.modules && activeModuleIndex === course.modules.length - 1) ? 0.3 : 1, cursor: (course.modules && activeModuleIndex === course.modules.length - 1) ? 'not-allowed' : 'pointer' }}
                >
                  Next Module
                </button>
              </div>
            </>
          ) : (
            // Assignments Tab Content
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '5px' }}>Course Assignments</h3>
              {assignments.length > 0 ? (
                assignments.map(ass => {
                  const sub = submissions.find(s => s.assignment_id === ass.id);
                  const isSubmitted = !!sub;
                  const isGraded = sub?.status === 'graded';
                  
                  return (
                    <div 
                      key={ass.id} 
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: '12px', 
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{ass.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            📅 Due Date: {ass.due_date ? new Date(ass.due_date).toLocaleString() : 'No due date'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontWeight: 600,
                            background: isGraded ? 'rgba(16, 185, 129, 0.1)' : (isSubmitted ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                            color: isGraded ? '#10b981' : (isSubmitted ? '#3b82f6' : '#f59e0b')
                          }}>
                            {isGraded ? 'Graded' : (isSubmitted ? 'Handed In' : 'Assigned')}
                          </span>
                          {isGraded && (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              Grade: {sub.grade}
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{ass.description}</p>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '5px' }}>
                        {isSubmitted ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>📎 Submitted Work:</span>
                              <a href={sub.file_path} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                                View Submission
                              </a>
                            </div>
                            {!isGraded && (
                              <label className="filter-pill" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
                                🔄 Resubmit File
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleFileUpload(e, ass.id)} 
                                />
                              </label>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label className="login-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>
                              📎 Add Submission File
                              <input 
                                type="file" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileUpload(e, ass.id)} 
                              />
                            </label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attach work and mark as done</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No assignments posted for this course track yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Active Quiz */}
        <div className="edusphere-card workspace-quiz-panel">
          <div className="quiz-header">
            <span className="pulse-indicator pulse-purple"></span>
            <span>Concept Assessment Quiz</span>
          </div>

          {activeModule ? (
            isModuleCompleted || quizState === 'correct' ? (
              <div className="quiz-passed-view">
                <div className="passed-icon">🎉</div>
                <h4>Assessment Completed!</h4>
                <p>You have successfully evaluated this module. +100 Student XP has been awarded and added to your total.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="quiz-question-box">
                  {activeModule.quiz.question}
                </div>
                <div className="quiz-options-list">
                  {activeModule.quiz.options.map((option, idx) => {
                    let optionClass = '';
                    if (selectedOption === idx) {
                      if (quizState === 'selected') optionClass = 'selected';
                      if (quizState === 'correct') optionClass = 'correct';
                      if (quizState === 'incorrect') optionClass = 'incorrect';
                    }

                    return (
                      <button
                        key={idx}
                        className={`quiz-option-button ${optionClass}`}
                        onClick={() => handleOptionClick(idx)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {quizState === 'correct' && (
                  <div className="quiz-feedback success">✓ Correct! Module assessment passed.</div>
                )}
                {quizState === 'incorrect' && (
                  <div className="quiz-feedback error">✗ Incorrect answer. Review the slides and try again!</div>
                )}

                <button
                  className="quiz-submit-trigger"
                  disabled={selectedOption === null}
                  onClick={handleSubmitQuiz}
                  style={{ marginTop: 'auto' }}
                >
                  Verify Answer
                </button>
              </div>
            )
          ) : (
            <p>No assessment for this module.</p>
          )}
        </div>
      </div>
    </div>
  );
}
