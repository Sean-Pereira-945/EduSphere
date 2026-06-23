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

        {/* Center: Slide Viewer */}
        <div className="edusphere-card workspace-lecture-panel">
          <div className="lecture-viewer-body">
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
              Module {activeModuleIndex + 1} of {course.modules.length}
            </span>
            <button
              className="filter-pill"
              disabled={activeModuleIndex === course.modules.length - 1}
              onClick={() => setActiveModuleIndex(prev => prev + 1)}
              style={{ opacity: activeModuleIndex === course.modules.length - 1 ? 0.3 : 1, cursor: activeModuleIndex === course.modules.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              Next Module
            </button>
          </div>
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
