import React, { useState, useRef, useEffect } from 'react';
import CustomSelect from './CustomSelect';

// ── Reusable dual-mode upload field ──────────────────────────────────────────
function FileUploadField({ label, accept, file, onFileChange, urlValue, onUrlChange, previewType = 'none' }) {
  const [mode, setMode] = useState(file ? 'file' : 'url');
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setMode('file');
      onFileChange(dropped);
    }
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) {
      setMode('file');
      onFileChange(f);
    }
  };

  const clearFile = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const previewUrl = file ? URL.createObjectURL(file) : urlValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="login-label">{label}</label>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
        {['file', 'url'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: mode === m ? 'var(--accent-cyan)' : 'transparent',
              color: mode === m ? '#0f172a' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize'
            }}
          >
            {m === 'file' ? '📁 Upload' : '🔗 URL'}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <div>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '10px',
              padding: file ? '12px 16px' : '20px',
              background: dragOver ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.2)',
              cursor: file ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '54px'
            }}
          >
            {file ? (
              <>
                {/* Image preview for logo */}
                {previewType === 'image' && previewUrl && (
                  <img src={previewUrl} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                {/* PDF icon for syllabus/materials */}
                {previewType !== 'image' && (
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📄</span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '2px' }}>✕</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>⬆️</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Drop file here or <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>click to browse</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{accept}</div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept={accept} onChange={handleFileInput} style={{ display: 'none' }} />
        </div>
      ) : (
        <input
          type="url"
          className="login-input"
          placeholder="https://..."
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      )}

      {/* Image preview when URL mode has a value */}
      {mode === 'url' && urlValue && previewType === 'image' && (
        <img src={urlValue} alt="logo preview" onError={(e) => e.target.style.display='none'} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TeacherDashboard({ token, profile, onLogout, onNavigateToWorkspace }) {
  const [courses, setCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Course Form States (Used for both Create and Edit)
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [capacity, setCapacity] = useState('');
  const [category, setCategory] = useState('Technical');
  const [logoUrl, setLogoUrl] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  // File states for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [syllabusFile, setSyllabusFile] = useState(null);

  // Edit State
  const [editCourseId, setEditCourseId] = useState(null);

  // Assignment Management States
  const [activeAssignmentsCourseId, setActiveAssignmentsCourseId] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseSubmissions, setCourseSubmissions] = useState([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
  const [newAssignmentFile, setNewAssignmentFile] = useState(null);
  const [gradesState, setGradesState] = useState({});

  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const fetchCourseAssignmentsAndSubmissions = async (courseId) => {
    try {
      const detailsRes = await fetch(`/api/courses/${courseId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const detailsData = await detailsRes.json();
      if (detailsData.assignments) {
        setCourseAssignments(detailsData.assignments);
      }

      const subsRes = await fetch(`/api/courses/${courseId}/teacher-submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subsData = await subsRes.json();
      if (subsData.success && subsData.submissions) {
        setCourseSubmissions(subsData.submissions);
        const initialGrades = {};
        subsData.submissions.forEach(sub => {
          initialGrades[sub.id] = sub.grade || '';
        });
        setGradesState(initialGrades);
      }
    } catch (err) {
      console.error("Error fetching course assignments & submissions:", err);
    }
  };

  const toggleAssignmentsPanel = (courseId) => {
    if (activeAssignmentsCourseId === courseId) {
      setActiveAssignmentsCourseId(null);
      setCourseAssignments([]);
      setCourseSubmissions([]);
    } else {
      setActiveAssignmentsCourseId(courseId);
      setNewAssignmentTitle('');
      setNewAssignmentDesc('');
      setNewAssignmentDueDate('');
      setNewAssignmentFile(null);
      fetchCourseAssignmentsAndSubmissions(courseId);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentDesc) return;
    setUploading(true);
    try {
      let res;
      if (newAssignmentFile) {
        // Send as FormData with optional PDF
        const fd = new FormData();
        fd.append('title', newAssignmentTitle);
        fd.append('description', newAssignmentDesc);
        if (newAssignmentDueDate) fd.append('due_date', newAssignmentDueDate);
        fd.append('file', newAssignmentFile);
        res = await fetch(`/api/courses/${activeAssignmentsCourseId}/assignments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });
      } else {
        res = await fetch(`/api/courses/${activeAssignmentsCourseId}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newAssignmentTitle,
            description: newAssignmentDesc,
            due_date: newAssignmentDueDate || null
          })
        });
      }
      if (res.ok) {
        triggerToast("Assignment created successfully!");
        setNewAssignmentTitle('');
        setNewAssignmentDesc('');
        setNewAssignmentDueDate('');
        setNewAssignmentFile(null);
        fetchCourseAssignmentsAndSubmissions(activeAssignmentsCourseId);
      } else {
        const data = await res.json();
        triggerToast("Failed to create assignment: " + data.message);
      }
    } catch (err) {
      triggerToast("Create assignment error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGradeSubmission = async (e, submissionId, grade) => {
    e.preventDefault();
    if (!grade) return;
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grade })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Submission graded successfully!");
        fetchCourseAssignmentsAndSubmissions(activeAssignmentsCourseId);
      } else {
        triggerToast("Grading failed: " + data.message);
      }
    } catch (err) {
      triggerToast("Grading error: " + err.message);
    }
  };

  const fetchTeacherData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const coursesRes = await fetch('/api/courses/teacher', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Detect expired / invalid token
      if (coursesRes.status === 401 || coursesRes.status === 403) {
        triggerToast('Session expired — please log in again.');
        setTimeout(() => onLogout && onLogout(), 1500);
        return;
      }

      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.courses);
      } else {
        console.error('Teacher courses fetch error:', coursesData.message);
      }

      const requestsRes = await fetch('/api/enrollments/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setPendingRequests(requestsData.requests);
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      triggerToast('Could not load dashboard data. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [token]);

  // Handle Approve / Reject
  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await fetch(`/api/enrollments/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Action failed');
      }
      triggerToast(`Enrollment request ${status} successfully.`);
      fetchTeacherData();
    } catch (err) {
      triggerToast(`Action failed: ${err.message}`);
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Deletion failed');
      }
      triggerToast('Course deleted successfully.');
      fetchTeacherData();
    } catch (err) {
      triggerToast(`Deletion failed: ${err.message}`);
    }
  };

  // Build the request body for save — uses FormData if files present, else JSON
  const buildSaveRequest = (courseId) => {
    const url = courseId ? `/api/courses/${courseId}` : '/api/courses';
    const method = courseId ? 'PUT' : 'POST';

    const hasFiles = logoFile || syllabusFile;

    if (hasFiles) {
      const fd = new FormData();
      fd.append('courseName', courseName);
      fd.append('description', description);
      fd.append('schedule', schedule);
      fd.append('capacity', String(Number(capacity)));
      fd.append('category', category);
      if (logoFile) fd.append('logo', logoFile);
      else if (logoUrl) fd.append('logoUrl', logoUrl);
      if (syllabusFile) fd.append('syllabus', syllabusFile);
      else if (syllabusUrl) fd.append('syllabusUrl', syllabusUrl);
      return { url, method, headers: { 'Authorization': `Bearer ${token}` }, body: fd };
    }

    return {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseName, description, schedule, capacity: Number(capacity), category, logoUrl, syllabusUrl })
    };
  };

  // Handle Save Course (Create / Edit)
  const handleSaveCourse = async (e, courseId = null) => {
    e.preventDefault();
    if (!courseName || !description || !schedule || !capacity) return;
    setUploading(true);

    try {
      const { url, method, headers, body } = buildSaveRequest(courseId);
      const res = await fetch(url, { method, headers, body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save course');
      }

      triggerToast(courseId ? 'Course updated successfully!' : 'Course created successfully!');
      setEditCourseId(null);
      setShowCreateForm(false);
      resetForm();
      fetchTeacherData();
    } catch (err) {
      triggerToast(`Save failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (course) => {
    setEditCourseId(course._id);
    setCourseName(course.name);
    setDescription(course.description);
    setSchedule(course.schedule);
    setCapacity(course.capacity);
    setCategory(course.category || 'Technical');
    setLogoUrl(course.logo || '');
    setSyllabusUrl(course.syllabusPath || '');
    setLogoFile(null);
    setSyllabusFile(null);
  };

  const cancelEdit = () => {
    setEditCourseId(null);
    resetForm();
  };

  const resetForm = () => {
    setCourseName('');
    setDescription('');
    setSchedule('');
    setCapacity('');
    setCategory('Technical');
    setLogoUrl('');
    setSyllabusUrl('');
    setLogoFile(null);
    setSyllabusFile(null);
  };

  // ── Shared course form fields ─────────────────────────────────────────────
  const CourseFormFields = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div className="login-input-group">
        <label className="login-label">Course Name</label>
        <input type="text" className="login-input" required value={courseName} onChange={(e) => setCourseName(e.target.value)} />
      </div>
      <div className="login-input-group">
        <label className="login-label">Category</label>
        <CustomSelect
          value={category}
          onChange={setCategory}
          options={[
            { value: 'Technical',        label: 'Technical' },
            { value: 'Non-technical',    label: 'Non-technical' },
            { value: 'Self-Development', label: 'Self-Development' },
            { value: 'Extra-curricular', label: 'Extra-curricular' },
          ]}
        />
      </div>
      <div className="login-input-group" style={{ gridColumn: 'span 2' }}>
        <label className="login-label">Description</label>
        <textarea className="login-input" required rows="3" style={{ resize: 'none' }} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="login-input-group">
        <label className="login-label">Schedule</label>
        <input type="text" className="login-input" placeholder="Mon/Wed 3-5pm" required value={schedule} onChange={(e) => setSchedule(e.target.value)} />
      </div>
      <div className="login-input-group">
        <label className="login-label">Capacity</label>
        <input type="number" className="login-input" required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>

      {/* Logo Upload */}
      <div className="login-input-group">
        <FileUploadField
          label="Course Logo (Optional)"
          accept="image/*"
          file={logoFile}
          onFileChange={setLogoFile}
          urlValue={logoUrl}
          onUrlChange={setLogoUrl}
          previewType="image"
        />
      </div>

      {/* Syllabus Upload */}
      <div className="login-input-group">
        <FileUploadField
          label="Syllabus (PDF or Image)"
          accept=".pdf,image/*"
          file={syllabusFile}
          onFileChange={setSyllabusFile}
          urlValue={syllabusUrl}
          onUrlChange={setSyllabusUrl}
          previewType="pdf"
        />
      </div>
    </div>
  );

  // Statistics summaries
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const capacityCourses = courses.filter(c => (c.students?.length || 0) >= c.capacity).length;

  return (
    <div className="edusphere-view-container" style={{ padding: '110px 40px 40px 40px', position: 'relative' }}>
      
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
            Teacher Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage enrollments, course directories, and syllabus lecture paths
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="login-btn"
            onClick={() => { resetForm(); setShowCreateForm(!showCreateForm); setEditCourseId(null); }}
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: '#0f172a', fontWeight: 700 }}
          >
            {showCreateForm ? 'Cancel Creation' : '+ Create New Course'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Total Courses
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '10px' }}>
            {totalCourses}
          </h2>
        </div>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Total Enrolled Students
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: 'var(--accent-purple)', marginTop: '10px' }}>
            {totalStudents}
          </h2>
        </div>
        <div className="edusphere-card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Courses at Capacity
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: '#f59e0b', marginTop: '10px' }}>
            {capacityCourses}
          </h2>
        </div>
      </div>

      {/* Pending Enrollments Table */}
      {pendingRequests.length > 0 && (
        <div className="edusphere-card" style={{ padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Pending Enrollments 
            <span style={{ fontSize: '0.8rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '20px' }}>
              {pendingRequests.length}
            </span>
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px 16px', color: '#fff' }}>Student</th>
                  <th style={{ padding: '12px 16px', color: '#fff' }}>Course</th>
                  <th style={{ padding: '12px 16px', color: '#fff' }}>Requested At</th>
                  <th style={{ padding: '12px 16px', color: '#fff' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{req.student_name}</div>
                      <div style={{ fontSize: '0.75rem' }}>{req.student_email}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#fff' }}>{req.course_name}</td>
                    <td style={{ padding: '16px' }}>{new Date(req.enrolled_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'approved')}
                          className="login-btn"
                          style={{ padding: '6px 15px', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'rejected')}
                          className="filter-pill"
                          style={{ padding: '6px 15px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline Create Course Specification Card */}
      {showCreateForm && (
        <div className="edusphere-card" style={{ padding: '30px', marginBottom: '30px', border: '1px solid var(--accent-cyan)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.5rem', marginBottom: '20px' }}>
            Create New Course Specification
          </h2>
          <form onSubmit={(e) => handleSaveCourse(e)}>
            <CourseFormFields />
            <div style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
              <button
                type="submit"
                className="login-btn"
                disabled={uploading}
                style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: '#0f172a', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {uploading ? (
                  <>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #0f172a', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Uploading...
                  </>
                ) : 'Save Specifications'}
              </button>
              <button type="button" className="filter-pill" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Courses List (Horizontal Expanding Cards) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '5px' }}>
          My Courses
        </h2>

        {loading ? (
          <div className="edusphere-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,242,254,0.1)', borderTop: '3px solid var(--accent-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your courses...</p>
          </div>
        ) : courses.length > 0 ? (
          courses.map(c => {
            const isEditing = editCourseId === c._id;
            return (
              <div 
                key={c._id} 
                className="edusphere-card" 
                style={{ 
                  padding: '24px', 
                  border: isEditing ? '1px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Header/Summary Card Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {c.logo && (
                        <img src={c.logo} alt={c.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      )}
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{c.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                      <span>Schedule: {c.schedule}</span>
                      <span>Enrolled: {(c.students?.length || 0)} / {c.capacity}</span>
                    </div>
                  </div>

                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => onNavigateToWorkspace(c._id)}
                        className="login-btn"
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      >
                        Open Course
                      </button>
                      <button 
                        onClick={() => toggleAssignmentsPanel(c._id)}
                        className="filter-pill"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                      >
                        {activeAssignmentsCourseId === c._id ? 'Close Assignments' : 'Manage Assignments'}
                      </button>
                      <button 
                        onClick={() => startEdit(c)}
                        className="filter-pill"
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      >
                        Edit Specs
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(c._id)}
                        className="filter-pill"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Assignments Management Expanded Panel */}
                {activeAssignmentsCourseId === c._id && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr',
                    gap: '30px'
                  }}>
                    
                    {/* Left: Create Assignment Form */}
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px' }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '15px' }}>
                        Create New Assignment
                      </h4>
                      <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="login-input-group">
                          <label className="login-label">Assignment Title</label>
                          <input 
                            type="text" 
                            className="login-input" 
                            required 
                            placeholder="e.g. Essay 1: Modernism" 
                            value={newAssignmentTitle} 
                            onChange={(e) => setNewAssignmentTitle(e.target.value)} 
                          />
                        </div>
                        <div className="login-input-group">
                          <label className="login-label">Description / Instructions</label>
                          <textarea 
                            className="login-input" 
                            required 
                            rows="4" 
                            style={{ resize: 'none' }}
                            placeholder="Write instructions or assignment details..." 
                            value={newAssignmentDesc} 
                            onChange={(e) => setNewAssignmentDesc(e.target.value)} 
                          />
                        </div>
                        <div className="login-input-group">
                          <label className="login-label">Due Date (Optional)</label>
                          <input 
                            type="datetime-local" 
                            className="login-input" 
                            value={newAssignmentDueDate} 
                            onChange={(e) => setNewAssignmentDueDate(e.target.value)} 
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>

                        {/* PDF Attachment */}
                        <div className="login-input-group">
                          <FileUploadField
                            label="Attach PDF (Optional)"
                            accept=".pdf,.doc,.docx"
                            file={newAssignmentFile}
                            onFileChange={setNewAssignmentFile}
                            urlValue=""
                            onUrlChange={() => {}}
                            previewType="pdf"
                          />
                        </div>

                        <button
                          type="submit"
                          className="login-btn"
                          disabled={uploading}
                          style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))', color: '#fff', fontWeight: 700, border: 'none', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          {uploading ? (
                            <>
                              <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              Uploading...
                            </>
                          ) : 'Create & Post'}
                        </button>
                      </form>
                    </div>

                    {/* Right: List of Assignments and Submissions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '500px' }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '5px' }}>
                        Existing Assignments & Submissions
                      </h4>
                      {courseAssignments.length > 0 ? (
                        courseAssignments.map(ass => {
                          const assSubs = courseSubmissions.filter(s => s.assignment_id === ass.id);
                          return (
                            <div 
                              key={ass.id} 
                              style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.06)', 
                                borderRadius: '12px', 
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                <div>
                                  <h5 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{ass.title}</h5>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ass.description}</p>
                                </div>
                                {ass.file_path && (
                                  <a
                                    href={ass.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="filter-pill"
                                    style={{ padding: '4px 10px', fontSize: '0.7rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                                  >
                                    📄 View PDF
                                  </a>
                                )}
                              </div>
                              
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '5px' }}>
                                <h6 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
                                  Student Submissions ({assSubs.length})
                                </h6>
                                {assSubs.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {assSubs.map(sub => (
                                      <div 
                                        key={sub.id} 
                                        style={{ 
                                          background: 'rgba(255,255,255,0.02)', 
                                          padding: '10px 14px', 
                                          borderRadius: '8px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          flexWrap: 'wrap',
                                          gap: '10px',
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        <div>
                                          <div style={{ fontWeight: 600, color: '#fff' }}>{sub.student_name}</div>
                                          <a href={sub.file_path} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontSize: '0.75rem' }}>
                                            View Attached Work
                                          </a>
                                        </div>
                                        <form 
                                          onSubmit={(e) => handleGradeSubmission(e, sub.id, gradesState[sub.id])} 
                                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                                              width: '120px',
                                              fontSize: '0.75rem'
                                            }}
                                          />
                                          <button 
                                            type="submit" 
                                            className="login-btn" 
                                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                          >
                                            {sub.status === 'graded' ? 'Regrade' : 'Submit Grade'}
                                          </button>
                                        </form>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    No submissions yet for this assignment.
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No assignments posted yet.
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Inline Expanded Edit Form */}
                {isEditing && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <form onSubmit={(e) => handleSaveCourse(e, c._id)}>
                      <CourseFormFields />
                      <div style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
                        <button
                          type="submit"
                          className="login-btn"
                          disabled={uploading}
                          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: '#0f172a', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {uploading ? (
                            <>
                              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #0f172a', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              Uploading...
                            </>
                          ) : 'Save Specifications'}
                        </button>
                        <button type="button" className="filter-pill" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="edusphere-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses directory found. Click "+ Create New Course" to add one.
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <div className={`warning-toast ${toast.show ? 'visible' : ''}`}>
        {toast.message}
      </div>

      {/* Spinner keyframe (inline) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

    </div>
  );
}
