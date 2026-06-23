import React, { useState, useEffect } from 'react';

export default function TeacherDashboard({ token, profile, onLogout }) {
  const [courses, setCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Course Form States (Used for both Create and Edit)
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [capacity, setCapacity] = useState('');
  const [category, setCategory] = useState('Technical');
  const [logoUrl, setLogoUrl] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600');

  // Edit State
  const [editCourseId, setEditCourseId] = useState(null);

  // Assignment Management States
  const [activeAssignmentsCourseId, setActiveAssignmentsCourseId] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseSubmissions, setCourseSubmissions] = useState([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
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
      fetchCourseAssignmentsAndSubmissions(courseId);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentDesc) return;
    try {
      const res = await fetch(`/api/courses/${activeAssignmentsCourseId}/assignments`, {
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
      if (res.ok) {
        triggerToast("Assignment created successfully!");
        setNewAssignmentTitle('');
        setNewAssignmentDesc('');
        setNewAssignmentDueDate('');
        fetchCourseAssignmentsAndSubmissions(activeAssignmentsCourseId);
      } else {
        const data = await res.json();
        triggerToast("Failed to create assignment: " + data.message);
      }
    } catch (err) {
      triggerToast("Create assignment error: " + err.message);
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
    try {
      const coursesRes = await fetch('/api/courses/teacher', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.courses);
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

  // Handle Save Course (Create / Edit)
  const handleSaveCourse = async (e, courseId = null) => {
    e.preventDefault();
    if (!courseName || !description || !schedule || !capacity) return;

    const url = courseId ? `/api/courses/${courseId}` : '/api/courses';
    const method = courseId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseName,
          description,
          schedule,
          capacity: Number(capacity),
          category,
          logoUrl,
          syllabusUrl
        })
      });

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
    setSyllabusUrl('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600');
  };

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
          <form onSubmit={(e) => handleSaveCourse(e)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="login-input-group">
              <label className="login-label">Course Name</label>
              <input type="text" className="login-input" required value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>
            <div className="login-input-group">
              <label className="login-label">Category</label>
              <select className="login-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                <option value="Technical">Technical</option>
                <option value="Non-technical">Non-technical</option>
                <option value="Self-Development">Self-Development</option>
                <option value="Extra-curricular">Extra-curricular</option>
              </select>
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
            <div className="login-input-group">
              <label className="login-label">Logo Image URL (Optional)</label>
              <input type="url" className="login-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            <div className="login-input-group">
              <label className="login-label">Syllabus URL (Optional)</label>
              <input type="url" className="login-input" value={syllabusUrl} onChange={(e) => setSyllabusUrl(e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="submit" className="login-btn" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: '#0f172a', fontWeight: 700, border: 'none' }}>
                Save Specifications
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

        {courses.length > 0 ? (
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
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{c.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                      <span>📅 {c.schedule}</span>
                      <span>👥 Enrolled: {(c.students?.length || 0)} / {c.capacity}</span>
                    </div>
                  </div>

                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '10px' }}>
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
                        <button type="submit" className="login-btn" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))', color: '#fff', fontWeight: 700, border: 'none', marginTop: '5px' }}>
                          Create & Post
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
                              <h5 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{ass.title}</h5>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ass.description}</p>
                              
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
                    <form onSubmit={(e) => handleSaveCourse(e, c._id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="login-input-group">
                        <label className="login-label">Course Name</label>
                        <input type="text" className="login-input" required value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                      </div>
                      <div className="login-input-group">
                        <label className="login-label">Category</label>
                        <select className="login-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                          <option value="Technical">Technical</option>
                          <option value="Non-technical">Non-technical</option>
                          <option value="Self-Development">Self-Development</option>
                          <option value="Extra-curricular">Extra-curricular</option>
                        </select>
                      </div>
                      <div className="login-input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="login-label">Description</label>
                        <textarea className="login-input" required rows="3" style={{ resize: 'none' }} value={description} onChange={(e) => setDescription(e.target.value)} />
                      </div>
                      <div className="login-input-group">
                        <label className="login-label">Schedule</label>
                        <input type="text" className="login-input" required value={schedule} onChange={(e) => setSchedule(e.target.value)} />
                      </div>
                      <div className="login-input-group">
                        <label className="login-label">Capacity</label>
                        <input type="number" className="login-input" required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                      </div>
                      <div className="login-input-group">
                        <label className="login-label">Logo Image URL</label>
                        <input type="url" className="login-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                      </div>
                      <div className="login-input-group">
                        <label className="login-label">Syllabus URL</label>
                        <input type="url" className="login-input" value={syllabusUrl} onChange={(e) => setSyllabusUrl(e.target.value)} />
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button type="submit" className="login-btn" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', color: '#0f172a', fontWeight: 700, border: 'none' }}>
                          Save Specifications
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

    </div>
  );
}
