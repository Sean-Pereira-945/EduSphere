import React, { useState, useEffect, useRef } from 'react';

export default function CourseWorkspace({ 
  course, 
  studentProfile, 
  userType = 'student',
  token,
  onBackToDashboard 
}) {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people'
  
  // States for Stream (Announcements)
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  
  // States for Classwork
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]); // Student's own submissions
  const [teacherSubmissions, setTeacherSubmissions] = useState([]); // All submissions for grading
  
  // Teacher Action Panels / Form states
  const [showAddModule, setShowAddModule] = useState(false);
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  
  const [editingModId, setEditingModId] = useState(null);
  const [editModTitle, setEditModTitle] = useState('');
  const [editModDesc, setEditModDesc] = useState('');

  const [addingMaterialModId, setAddingMaterialModId] = useState(null);
  const [matTitle, setMatTitle] = useState('');
  const [matFile, setMatFile] = useState(null);
  const [matDragOver, setMatDragOver] = useState(false);
  const [matUploading, setMatUploading] = useState(false);
  const matInputRef = useRef(null);

  const [addingAssignmentModId, setAddingAssignmentModId] = useState(null);
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assDueDate, setAssDueDate] = useState('');
  const [assFile, setAssFile] = useState(null);
  const [assDragOver, setAssDragOver] = useState(false);
  const [assUploading, setAssUploading] = useState(false);
  const assInputRef = useRef(null);

  const [viewingSubmissionsAssId, setViewingSubmissionsAssId] = useState(null);
  const [gradesState, setGradesState] = useState({});

  // Comments state
  const [commentsState, setCommentsState] = useState({}); // { [modId]: [comments] }
  const [newCommentText, setNewCommentText] = useState({}); // { [modId]: 'text' }

  const activeToken = token || localStorage.getItem('token') || '';

  const fetchData = async () => {
    if (!course || !course.id) return;
    try {
      const detailsRes = await fetch(`/api/courses/${course.id}/details`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await detailsRes.json();
      
      if (data) {
        setModules(data.modules || []);
        setAnnouncements(data.announcements || []);
        setAssignments(data.assignments || []);
        
        // Populate comments for each module
        const commentsMap = {};
        if (data.modules) {
          data.modules.forEach(m => {
            commentsMap[m.id] = m.comments || [];
          });
        }
        setCommentsState(commentsMap);
      }

      if (userType === 'student') {
        const subsRes = await fetch(`/api/courses/${course.id}/submissions`, {
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
        const subsData = await subsRes.json();
        if (subsData.success && subsData.submissions) {
          setSubmissions(subsData.submissions);
        }
      } else if (userType === 'teacher') {
        const subsRes = await fetch(`/api/courses/${course.id}/teacher-submissions`, {
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
        const subsData = await subsRes.json();
        if (subsData.success && subsData.submissions) {
          setTeacherSubmissions(subsData.submissions);
          const initialGrades = {};
          subsData.submissions.forEach(sub => {
            initialGrades[sub.id] = sub.grade || '';
          });
          setGradesState(initialGrades);
        }
      }
    } catch (err) {
      console.error("Error fetching classroom workspace data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [course, userType]);

  // ----------------------------------------------------
  // ANNOUNCEMENTS
  // ----------------------------------------------------
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      const res = await fetch(`/api/courses/${course.id}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ content: newAnnouncement })
      });
      if (res.ok) {
        setNewAnnouncement('');
        fetchData();
      } else {
        alert("Failed to post announcement");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // MODULES CRUD
  // ----------------------------------------------------
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!modTitle.trim()) return;

    try {
      const res = await fetch(`/api/courses/${course.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ title: modTitle, description: modDesc })
      });
      if (res.ok) {
        setModTitle('');
        setModDesc('');
        setShowAddModule(false);
        fetchData();
      } else {
        alert("Failed to create module");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditModule = (mod) => {
    setEditingModId(mod.id);
    setEditModTitle(mod.title);
    setEditModDesc(mod.description || '');
  };

  const handleUpdateModule = async (e, modId) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/modules/${modId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ title: editModTitle, description: editModDesc })
      });
      if (res.ok) {
        setEditingModId(null);
        fetchData();
      } else {
        alert("Failed to update module");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // MATERIALS
  // ----------------------------------------------------
  const handleUploadMaterial = async (e, modId) => {
    e.preventDefault();
    if (!matTitle.trim() || !matFile) return;
    setMatUploading(true);

    const formData = new FormData();
    formData.append('title', matTitle);
    formData.append('file', matFile);

    try {
      const res = await fetch(`/api/modules/${modId}/materials`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${activeToken}` },
        body: formData
      });
      if (res.ok) {
        setMatTitle('');
        setMatFile(null);
        setAddingMaterialModId(null);
        fetchData();
      } else {
        const d = await res.json();
        alert("Failed to upload material: " + (d.message || ""));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatUploading(false);
    }
  };

  // ----------------------------------------------------
  // ASSIGNMENTS
  // ----------------------------------------------------
  const handleCreateAssignment = async (e, modId) => {
    e.preventDefault();
    if (!assTitle.trim()) return;
    setAssUploading(true);

    try {
      let res;
      if (assFile) {
        const fd = new FormData();
        fd.append('title', assTitle);
        fd.append('description', `${assDesc} (Module ID: ${modId})`);
        if (assDueDate) fd.append('due_date', assDueDate);
        fd.append('file', assFile);
        res = await fetch(`/api/courses/${course.id}/assignments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` },
          body: fd
        });
      } else {
        res = await fetch(`/api/courses/${course.id}/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` },
          body: JSON.stringify({
            title: assTitle,
            description: `${assDesc} (Module ID: ${modId})`,
            due_date: assDueDate || null
          })
        });
      }
      if (res.ok) {
        setAssTitle('');
        setAssDesc('');
        setAssDueDate('');
        setAssFile(null);
        setAddingAssignmentModId(null);
        fetchData();
      } else {
        alert("Failed to create assignment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssUploading(false);
    }
  };

  const handleStudentSubmitAssignment = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert("Assignment submitted successfully");
        fetchData();
      } else {
        alert("Submission failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (e, submissionId, grade) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ grade })
      });
      if (res.ok) {
        alert("Grade recorded successfully");
        fetchData();
      } else {
        alert("Grading failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // MODULE COMMENTS
  // ----------------------------------------------------
  const handlePostComment = async (modId) => {
    const content = newCommentText[modId];
    if (!content || !content.trim()) return;

    try {
      const res = await fetch(`/api/modules/${modId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setNewCommentText({ ...newCommentText, [modId]: '' });
        fetchData();
      } else {
        alert("Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="edusphere-view-container" style={{ paddingBottom: '60px' }}>
      
      {/* Return Button */}
      <button 
        className="filter-pill"
        onClick={onBackToDashboard}
        style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        Back to Portal
      </button>

      {/* Classroom Header Banner (exactly as in mockups) */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px 30px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '16px 16px',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '3rem', 
            fontWeight: '700', 
            color: '#fff', 
            margin: 0,
            lineHeight: 1.15
          }}>
            {course?.name}
          </h1>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Prof. {course?.instructor || course?.teacher?.name || 'Staff'}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '30px',
        gap: '30px'
      }}>
        {['stream', 'classwork', 'people'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              padding: '12px 10px',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab ? '600' : '400',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.25s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* STREAM TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'stream' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Post Announcement Form (Teacher only) */}
          {userType === 'teacher' && (
            <div className="edusphere-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                Make an Announcement
              </h3>
              <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea
                  className="login-input"
                  required
                  rows="3"
                  style={{ resize: 'none', background: 'rgba(0,0,0,0.3)' }}
                  placeholder="Share updates with your class..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="login-btn"
                  style={{ alignSelf: 'flex-end', padding: '8px 24px', fontSize: '0.85rem' }}
                >
                  Post
                </button>
              </form>
            </div>
          )}

          {/* Announcements list */}
          {announcements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {announcements.map(ann => (
                <div 
                  key={ann.id} 
                  className="edusphere-card" 
                  style={{ 
                    padding: '24px', 
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {getInitials(course?.instructor || course?.teacher?.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>
                        {course?.instructor || course?.teacher?.name || 'Staff'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(ann.created_at || ann.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="edusphere-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No announcements yet.
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CLASSWORK TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'classwork' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Create Module Header controls (Teacher only) */}
          {userType === 'teacher' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="login-btn"
                onClick={() => setShowAddModule(!showAddModule)}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {showAddModule ? 'Cancel' : 'Create Module'}
              </button>
            </div>
          )}

          {/* Add Module inline block */}
          {showAddModule && (
            <div className="edusphere-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                New Module specifications
              </h3>
              <form onSubmit={handleCreateModule} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="login-input-group">
                  <label className="login-label">Module Title</label>
                  <input 
                    type="text" 
                    className="login-input" 
                    required 
                    placeholder="e.g. Module 1: Introduction" 
                    value={modTitle} 
                    onChange={(e) => setModTitle(e.target.value)} 
                  />
                </div>
                <div className="login-input-group">
                  <label className="login-label">Brief Description</label>
                  <textarea 
                    className="login-input" 
                    rows="3" 
                    style={{ resize: 'none' }}
                    placeholder="Write a brief overview of module..." 
                    value={modDesc} 
                    onChange={(e) => setModDesc(e.target.value)} 
                  />
                </div>
                <button type="submit" className="login-btn" style={{ alignSelf: 'flex-end', padding: '8px 24px' }}>
                  Create
                </button>
              </form>
            </div>
          )}

          {/* List of Modules */}
          {modules.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {modules.map(mod => {
                const isEditing = editingModId === mod.id;
                const isAddingMaterial = addingMaterialModId === mod.id;
                const isAddingAssignment = addingAssignmentModId === mod.id;

                // Find assignments linked to this module (our custom mock binding via desc keywords)
                const modAssignments = assignments.filter(ass => 
                  ass.description.includes(`(Module ID: ${mod.id})`)
                );

                return (
                  <div 
                    key={mod.id} 
                    className="edusphere-card" 
                    style={{ 
                      padding: '30px', 
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}
                  >
                    
                    {/* Module Title Section */}
                    {isEditing ? (
                      <form onSubmit={(e) => handleUpdateModule(e, mod.id)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input 
                          type="text" 
                          className="login-input" 
                          required 
                          value={editModTitle} 
                          onChange={(e) => setEditModTitle(e.target.value)} 
                        />
                        <textarea 
                          className="login-input" 
                          rows="2" 
                          value={editModDesc} 
                          onChange={(e) => setEditModDesc(e.target.value)} 
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" className="login-btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                            Save
                          </button>
                          <button type="button" className="filter-pill" onClick={() => setEditingModId(null)} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                            {mod.title}
                          </h2>
                          {mod.description && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4', margin: '8px 0 0 0' }}>
                              {mod.description}
                            </p>
                          )}
                        </div>
                        {userType === 'teacher' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="filter-pill"
                              onClick={() => startEditModule(mod)}
                              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                            >
                              Edit specs
                            </button>
                            <button 
                              className="filter-pill"
                              onClick={() => setAddingMaterialModId(isAddingMaterial ? null : mod.id)}
                              style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                            >
                              Add Material
                            </button>
                            <button 
                              className="filter-pill"
                              onClick={() => setAddingAssignmentModId(isAddingAssignment ? null : mod.id)}
                              style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                            >
                              Add Assignment
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline Add Material panel (Teacher only) */}
                    {isAddingMaterial && (
                      <div style={{ padding: '20px', background: 'rgba(99,102,241,0.04)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>📎</span> Upload Study Material
                        </h4>
                        <form onSubmit={(e) => handleUploadMaterial(e, mod.id)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div className="login-input-group">
                            <label className="login-label">Material Title</label>
                            <input 
                              type="text" 
                              className="login-input" 
                              required 
                              placeholder="e.g. Lecture 1 Notes" 
                              value={matTitle} 
                              onChange={(e) => setMatTitle(e.target.value)} 
                            />
                          </div>

                          {/* Styled Drop Zone */}
                          <div className="login-input-group">
                            <label className="login-label">File (PDF, images, docs)</label>
                            <div
                              onDragOver={(e) => { e.preventDefault(); setMatDragOver(true); }}
                              onDragLeave={() => setMatDragOver(false)}
                              onDrop={(e) => { e.preventDefault(); setMatDragOver(false); const f = e.dataTransfer.files[0]; if (f) setMatFile(f); }}
                              onClick={() => !matFile && matInputRef.current?.click()}
                              style={{
                                border: `2px dashed ${matDragOver ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.14)'}`,
                                borderRadius: '10px',
                                padding: matFile ? '12px 16px' : '24px 16px',
                                background: matDragOver ? 'rgba(6,182,212,0.06)' : 'rgba(0,0,0,0.2)',
                                cursor: matFile ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minHeight: '54px'
                              }}
                            >
                              {matFile ? (
                                <>
                                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{matFile.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{(matFile.size / 1024).toFixed(1)} KB</div>
                                  </div>
                                  <button type="button" onClick={() => { setMatFile(null); if (matInputRef.current) matInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                                </>
                              ) : (
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                  <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>⬆️</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drop file here or <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>click to browse</span></div>
                                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>PDF, DOCX, images, etc.</div>
                                </div>
                              )}
                            </div>
                            <input ref={matInputRef} type="file" onChange={(e) => setMatFile(e.target.files[0])} style={{ display: 'none' }} />
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="submit"
                              className="login-btn"
                              disabled={matUploading || !matFile}
                              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: (!matFile && !matUploading) ? 0.5 : 1 }}
                            >
                              {matUploading ? (
                                <><span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Uploading...</>
                              ) : '⬆️ Upload Material'}
                            </button>
                            <button type="button" className="filter-pill" onClick={() => { setAddingMaterialModId(null); setMatFile(null); setMatTitle(''); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Inline Add Assignment panel (Teacher only) */}
                    {isAddingAssignment && (
                      <div style={{ padding: '20px', background: 'rgba(6,182,212,0.03)', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.15)' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>📝</span> Post New Assignment
                        </h4>
                        <form onSubmit={(e) => handleCreateAssignment(e, mod.id)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div className="login-input-group">
                              <label className="login-label">Title</label>
                              <input 
                                type="text" 
                                className="login-input" 
                                required 
                                placeholder="Assignment Title" 
                                value={assTitle} 
                                onChange={(e) => setAssTitle(e.target.value)} 
                              />
                            </div>
                            <div className="login-input-group">
                              <label className="login-label">Deadline</label>
                              <input 
                                type="datetime-local" 
                                className="login-input" 
                                value={assDueDate} 
                                onChange={(e) => setAssDueDate(e.target.value)} 
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          </div>
                          <div className="login-input-group">
                            <label className="login-label">Instructions</label>
                            <textarea 
                              className="login-input" 
                              required 
                              rows="3" 
                              placeholder="Write steps or criteria..." 
                              value={assDesc} 
                              onChange={(e) => setAssDesc(e.target.value)} 
                            />
                          </div>

                          {/* PDF attachment drop zone */}
                          <div className="login-input-group">
                            <label className="login-label">Attach PDF / Reference (Optional)</label>
                            <div
                              onDragOver={(e) => { e.preventDefault(); setAssDragOver(true); }}
                              onDragLeave={() => setAssDragOver(false)}
                              onDrop={(e) => { e.preventDefault(); setAssDragOver(false); const f = e.dataTransfer.files[0]; if (f) setAssFile(f); }}
                              onClick={() => !assFile && assInputRef.current?.click()}
                              style={{
                                border: `2px dashed ${assDragOver ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.12)'}`,
                                borderRadius: '10px',
                                padding: assFile ? '12px 16px' : '20px 16px',
                                background: assDragOver ? 'rgba(6,182,212,0.06)' : 'rgba(0,0,0,0.15)',
                                cursor: assFile ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              {assFile ? (
                                <>
                                  <span style={{ fontSize: '1.4rem' }}>📄</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assFile.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{(assFile.size / 1024).toFixed(1)} KB</div>
                                  </div>
                                  <button type="button" onClick={() => { setAssFile(null); if (assInputRef.current) assInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                                </>
                              ) : (
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                  <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📎</div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Drop PDF here or <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>click to browse</span></div>
                                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>Optional — .pdf, .doc, .docx</div>
                                </div>
                              )}
                            </div>
                            <input ref={assInputRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setAssFile(e.target.files[0])} style={{ display: 'none' }} />
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="submit"
                              className="login-btn"
                              disabled={assUploading}
                              style={{ padding: '8px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              {assUploading ? (
                                <><span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Posting...</>
                              ) : 'Post Assignment'}
                            </button>
                            <button type="button" className="filter-pill" onClick={() => { setAddingAssignmentModId(null); setAssFile(null); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Materials & Assignments Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                      
                      {/* 1. Materials List */}
                      {mod.materials && mod.materials.length > 0 ? (
                        mod.materials.map(mat => (
                          <div 
                            key={mat.id} 
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)', 
                              borderRadius: '12px', 
                              padding: '16px 20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '15px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>File:</span>
                              <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '500' }}>
                                {mat.title}
                              </span>
                            </div>
                            <a 
                              href={mat.file_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="filter-pill"
                              style={{ padding: '6px 16px', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.1)' }}
                            >
                              Open file
                            </a>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '5px' }}>
                          No reference materials uploaded yet.
                        </div>
                      )}

                      {/* 2. Assignments List */}
                      {modAssignments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                            Assignments ({modAssignments.length})
                          </h4>
                          {modAssignments.map(ass => {
                            const studentSub = submissions.find(s => s.assignment_id === ass.id);
                            const allSubs = teacherSubmissions.filter(s => s.assignment_id === ass.id);
                            const isViewingSubs = viewingSubmissionsAssId === ass.id;

                            return (
                              <div 
                                key={ass.id} 
                                style={{ 
                                  background: 'rgba(127, 0, 255, 0.02)', 
                                  border: '1px solid rgba(127, 0, 255, 0.1)', 
                                  borderRadius: '12px', 
                                  padding: '20px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                                  <div>
                                    <h5 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>{ass.title}</h5>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', margin: '6px 0 0 0' }}>{ass.description.replace(/\(Module ID: \d+\)/, '')}</p>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                      Deadline: {ass.due_date ? new Date(ass.due_date).toLocaleString() : 'No deadline'}
                                    </div>
                                  </div>

                                  {/* Right actions based on role */}
                                  {userType === 'student' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                      {studentSub ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Submitted</span>
                                          {studentSub.grade ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Grade: {studentSub.grade}</span>
                                          ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Waiting for grading</span>
                                          )}
                                        </div>
                                      ) : (
                                        <div>
                                          <label className="login-btn" style={{ padding: '6px 14px', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-block' }}>
                                            Upload Work
                                            <input 
                                              type="file" 
                                              style={{ display: 'none' }} 
                                              onChange={(e) => handleStudentSubmitAssignment(e, ass.id)} 
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <button 
                                        className="filter-pill"
                                        onClick={() => setViewingSubmissionsAssId(isViewingSubs ? null : ass.id)}
                                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                                      >
                                        {isViewingSubs ? 'Hide Submissions' : `View Submissions (${allSubs.length})`}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Expanded Grading section (Teacher only) */}
                                {userType === 'teacher' && isViewingSubs && (
                                  <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h6 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '10px' }}>Student Submissions</h6>
                                    {allSubs.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {allSubs.map(sub => (
                                          <div 
                                            key={sub.id}
                                            style={{
                                              background: 'rgba(255, 255, 255, 0.02)',
                                              padding: '10px 15px',
                                              borderRadius: '8px',
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'center',
                                              flexWrap: 'wrap',
                                              gap: '15px'
                                            }}
                                          >
                                            <div>
                                              <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.8rem' }}>{sub.student_name}</div>
                                              <a href={sub.file_path} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'underline' }}>
                                                View Attached File
                                              </a>
                                            </div>
                                            <form 
                                              onSubmit={(e) => handleGradeSubmission(e, sub.id, gradesState[sub.id])}
                                              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                                            >
                                              <input 
                                                type="text" 
                                                placeholder="Grade (e.g. A, 90/100)"
                                                value={gradesState[sub.id] || ''}
                                                onChange={(e) => setGradesState({ ...gradesState, [sub.id]: e.target.value })}
                                                style={{
                                                  background: 'rgba(0,0,0,0.5)',
                                                  border: '1px solid rgba(255,255,255,0.1)',
                                                  borderRadius: '6px',
                                                  padding: '4px 8px',
                                                  color: '#fff',
                                                  fontSize: '0.75rem',
                                                  width: '120px'
                                                }}
                                              />
                                              <button type="submit" className="login-btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                                                {sub.status === 'graded' ? 'Regrade' : 'Grade'}
                                              </button>
                                            </form>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No submissions submitted yet.</div>
                                    )}
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Class Comments Section */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '12px' }}>
                        Class Comments
                      </h4>
                      
                      {/* Comments List */}
                      {commentsState[mod.id] && commentsState[mod.id].length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                          {commentsState[mod.id].map(comm => (
                            <div key={comm.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                color: 'var(--accent-cyan)',
                                flexShrink: 0
                              }}>
                                {getInitials(comm.user?.name)}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '600' }}>
                                  {comm.user?.name} 
                                  <span style={{ fontWeight: '400', color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.65rem' }}>
                                    {new Date(comm.created_at || comm.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>{comm.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                          No comments yet. Be the first to start the discussion.
                        </div>
                      )}

                      {/* Comment Input */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="login-input"
                          placeholder="Add a class comment..."
                          value={newCommentText[mod.id] || ''}
                          onChange={(e) => setNewCommentText({ ...newCommentText, [mod.id]: e.target.value })}
                          style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', padding: '8px 12px', fontSize: '0.8rem' }}
                        />
                        <button
                          onClick={() => handlePostComment(mod.id)}
                          className="login-btn"
                          style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                        >
                          Send
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="edusphere-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No modules posted yet.
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PEOPLE TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'people' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Teachers Section */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '700', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '20px' }}>
              Teacher
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 5px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-purple)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {getInitials(course?.instructor || course?.teacher?.name)}
              </div>
              <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '500' }}>
                {course?.instructor || course?.teacher?.name || 'Staff'}
              </span>
            </div>
          </div>

          {/* Classmates Section */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                Classmates
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {(course?.students?.length || 0)} {(course?.students?.length || 0) === 1 ? 'student' : 'students'}
              </span>
            </div>

            {course?.students && course.students.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {course.students.map(stud => (
                  <div key={stud._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 5px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {getInitials(stud.name)}
                    </div>
                    <span style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                      {stud.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '20px 0' }}>
                No classmates enrolled yet.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
