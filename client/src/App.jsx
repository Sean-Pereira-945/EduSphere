import React, { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import Navbar from './components/Navbar';
import CubesHero from './components/CubesHero';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Dashboard from './components/Dashboard';
import CourseCatalog from './components/CourseCatalog';
import CourseWorkspace from './components/CourseWorkspace';
import TeacherDashboard from './components/TeacherDashboard';
import { initialCourses } from './coursesData';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'login' | 'register' | 'dashboard' | 'catalog' | 'workspace'
  
  // Ref for high-performance scroll animation
  const robotRef = useRef(null);

  // Authentication Token State
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Courses database
  const [courses, setCourses] = useState([]);
  
  // Student enrollment state
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeCourseDetails, setActiveCourseDetails] = useState(null);
  
  // Student stats/progress
  const [studentProfile, setStudentProfile] = useState({
    name: localStorage.getItem('name') || 'Guest',
    gpa: '3.85',
    creditsLimit: 18,
    xp: parseInt(localStorage.getItem('student_xp') || '450', 10),
    completedModules: JSON.parse(localStorage.getItem('completed_modules') || '["cs-m1"]')
  });

  // Warning Toast notification
  const [toast, setToast] = useState({ show: false, message: '' });

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Fetch active courses and enrollments from Express
  const fetchUserData = async (authToken) => {
    if (!authToken) return;
    try {
      // Fetch all courses
      const coursesRes = await fetch('/api/courses/student', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const coursesData = await coursesRes.json();
      
      // Fetch my enrollments
      const enrollmentsRes = await fetch('/api/enrollments/my', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const enrollmentsData = await enrollmentsRes.json();

      if (coursesData.success) {
        const mapped = coursesData.courses.map(c => ({
          id: String(c._id),
          code: `${c.category || 'COURSE'}-${c._id}`,
          name: c.name,
          department: c.category || 'General',
          credits: 4, // Default credits for schedule allocation math
          professor: c.teacher ? c.teacher.name : 'Professor Staff',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          schedule: c.schedule || 'TBA',
          seatsAvailable: c.capacity - (c.enrolledCount || 0),
          totalSeats: c.capacity || 30,
          description: c.description || '',
          syllabus: c.syllabusPath || '',
          logo: c.logo || '',
          progress: 0
        }));
        setCourses(mapped);

        if (enrollmentsData.success) {
          // Map enrollments (approved or pending)
          const enrolledList = enrollmentsData.enrollments
            .filter(e => e.status === 'approved' || e.status === 'pending')
            .map(e => String(e.course_id));
          setEnrolledIds(enrolledList);
          
          if (enrolledList.length > 0 && !activeWorkspaceId) {
            setActiveWorkspaceId(enrolledList[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user data from API:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
  }, [token]);

  // Fetch specific workspace details when active course changes
  useEffect(() => {
    if (!activeWorkspaceId || !token) return;

    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/courses/${activeWorkspaceId}/details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.course) {
          const backendCourse = data.course;
          const mappedCourse = {
            id: String(backendCourse._id),
            code: `${backendCourse.category || 'COURSE'}-${backendCourse._id}`,
            name: backendCourse.name,
            instructor: backendCourse.teacher ? backendCourse.teacher.name : 'Professor Staff',
            syllabus: backendCourse.syllabusPath ? ['Syllabus Material', backendCourse.syllabusPath] : ['Course Syllabus Outline'],
            modules: data.modules.map(mod => ({
              id: String(mod.id),
              title: mod.title,
              content: mod.description || 'Welcome to this module. Slide contents and assessments are loaded dynamically.',
              quiz: {
                question: `Based on your reading of "${mod.title}", what is the primary learning objective?`,
                options: [
                  `Mastering the principles of ${mod.title}`,
                  `Deploying unrelated configurations`,
                  `Skipping the course workspace syllabus`,
                  `None of the above`
                ],
                correctIndex: 0
              }
            }))
          };
          setActiveCourseDetails(mappedCourse);
        }
      } catch (err) {
        console.error("Error loading course details:", err);
      }
    };

    fetchCourseDetails();
  }, [activeWorkspaceId, token]);

  // High performance direct DOM scroll listener (skips React re-renders)
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = window.scrollY / totalScroll;
      
      // Calculate global robot horizontal position: glides from right (55%) -> left (10%) -> right (55%)
      const robotLeftPercentage = 10 + (1 - Math.sin(progress * Math.PI)) * 45;
      
      // Calculate opacity: fades out completely at scroll midpoints (0.25 and 0.75) and peaks at section centers
      const robotOpacity = Math.abs(Math.cos(progress * Math.PI * 2));

      // Direct DOM updates for buttery smooth scroll
      if (robotRef.current) {
        robotRef.current.style.left = `${robotLeftPercentage}%`;
        robotRef.current.style.opacity = robotOpacity;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial positioning
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Trigger Toast Warning
  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  // Enrolling in a course
  const handleEnroll = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Check credits limit
    const currentCredits = courses
      .filter(c => enrolledIds.includes(c.id))
      .reduce((sum, c) => sum + c.credits, 0);

    if (currentCredits + course.credits > studentProfile.creditsLimit) {
      triggerToast(`Enrollment failed: Adding this course exceeds your ${studentProfile.creditsLimit}-credit limit!`);
      return;
    }

    try {
      const response = await fetch(`/api/courses/enroll/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Request failed');
      }

      triggerToast(`Successfully requested enrollment in ${course.code}! Waiting for teacher approval.`);
      fetchUserData(token);
    } catch (err) {
      triggerToast(`Enrollment failed: ${err.message}`);
    }
  };

  // Dropping a course
  const handleDrop = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const response = await fetch(`/api/courses/enroll/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Drop request failed');
      }

      triggerToast(`Successfully dropped ${course.code}.`);
      fetchUserData(token);
      
      if (activeWorkspaceId === courseId) {
        setActiveWorkspaceId(null);
        setActiveCourseDetails(null);
      }
    } catch (err) {
      triggerToast(`Drop failed: ${err.message}`);
    }
  };

  // Completing a module assessment
  const handleCompleteModule = (moduleId, xpAward) => {
    if (studentProfile.completedModules.includes(moduleId)) return;

    const newCompleted = [...studentProfile.completedModules, moduleId];
    const newXp = studentProfile.xp + xpAward;

    localStorage.setItem('completed_modules', JSON.stringify(newCompleted));
    localStorage.setItem('student_xp', String(newXp));

    setStudentProfile(prev => ({
      ...prev,
      xp: newXp,
      completedModules: newCompleted
    }));

    triggerToast(`Congratulations! Module completed. +${xpAward} XP!`);
  };

  // Calculate current credits
  const currentCredits = courses
    .filter(c => enrolledIds.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  // Aggressive spline logo watermark purger
  useEffect(() => {
    const purgeSplineLogos = () => {
      const viewers = document.querySelectorAll('spline-viewer');
      viewers.forEach(viewer => {
        if (viewer.shadowRoot) {
          const logo = viewer.shadowRoot.querySelector('#logo');
          if (logo) {
            logo.style.setProperty('display', 'none', 'important');
            logo.style.setProperty('opacity', '0', 'important');
            logo.style.setProperty('visibility', 'hidden', 'important');
            try {
              logo.remove();
            } catch(e) {}
          }
        }
      });

      const scanNode = (root) => {
        if (!root) return;
        
        const logos = root.querySelectorAll('#logo, a[href*="spline.design"], a[href*="spline"], .logo-container, #logo-container');
        logos.forEach(logo => {
          if (logo.classList.contains('logo-text') || logo.classList.contains('logo-glow') || logo.classList.contains('nav-logo')) {
            return;
          }
          logo.style.setProperty('display', 'none', 'important');
          logo.style.setProperty('opacity', '0', 'important');
          logo.style.setProperty('visibility', 'hidden', 'important');
          logo.style.setProperty('pointer-events', 'none', 'important');
          try {
            logo.remove();
          } catch(e) {}
        });

        const children = root.querySelectorAll('*');
        children.forEach(child => {
          if (child.shadowRoot) {
            scanNode(child.shadowRoot);
          }
        });
      };
      scanNode(document);
    };

    purgeSplineLogos();
    const purgeInterval = setInterval(purgeSplineLogos, 100);

    return () => {
      clearInterval(purgeInterval);
    };
  }, []);

  const handleHeroLoadComplete = () => {
    setIsLoaded(true);
  };

  // Custom view switching
  const handleViewChange = (viewName) => {
    setCurrentView(viewName);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setCourses([]);
    setEnrolledIds([]);
    setActiveWorkspaceId(null);
    setActiveCourseDetails(null);
    setCurrentView('home');
    triggerToast('Logged out of Student Portal.');
  };

  // When clicking classroom entry in Dashboard
  const handleNavigateToWorkspace = (courseId) => {
    setActiveWorkspaceId(courseId);
    setCurrentView('workspace');
  };

  const handleScrollToSection = (sectionName) => {
    setCurrentView('home');
    let targetRef = null;
    if (sectionName === 'home') targetRef = homeRef;
    if (sectionName === 'about') targetRef = aboutRef;
    if (sectionName === 'contact') targetRef = contactRef;

    if (targetRef && targetRef.current) {
      setTimeout(() => {
        targetRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const activeCourse = courses.find(c => c.id === activeWorkspaceId);

  return (
    <>
      {/* Loading Overlay */}
      {currentView === 'home' && (
        <div id="loader-wrapper" className={isLoaded ? 'loaded' : ''}>
          <div className="loader-content">
            <div className="spinner">
              <div className="double-bounce1"></div>
              <div className="double-bounce2"></div>
            </div>
            <div className="loader-text">Loading 3D Campus</div>
            <div className="loader-subtext">Initializing virtual classroom workspace...</div>
          </div>
        </div>
      )}

      {/* Floating Glassmorphic Navbar */}
      <Navbar 
        currentView={currentView}
        onViewChange={handleViewChange}
        onLoginClick={() => setCurrentView('login')}
        activeWorkspaceId={activeWorkspaceId}
        onLogout={handleLogout}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main 3D Cubes Hero Background (Fixed backdrop only on landing home view) */}
      {currentView === 'home' && (
        <CubesHero onLoadComplete={handleHeroLoadComplete} />
      )}

      {/* Global Scroll-based Spline Robot (Only rendered on Home screen, fixed positioning overlays the grid) */}
      {currentView === 'home' && (
        <div 
          ref={robotRef}
          className="global-scroll-robot"
          style={{
            position: 'fixed',
            top: '25%',
            left: '55%',
            width: '450px',
            height: '450px',
            pointerEvents: 'none',
            zIndex: 8,
            opacity: 1,
            transition: 'left 0.12s cubic-bezier(0.1, 0.8, 0.25, 1), opacity 0.18s ease-out',
            overflow: 'hidden'
          }}
        >
          {/* Shift canvas down and expand bottom-right outwards to prevent head clipping while hiding watermark */}
          <div style={{ 
            pointerEvents: 'auto', 
            width: 'calc(100% + 200px)', 
            height: 'calc(100% + 150px)', 
            position: 'absolute',
            left: '-100px',
            top: '0px'
          }}>
            <Spline 
              scene="https://prod.spline.design/LKjeLC9tL0AVGvJf/scene.splinecode" 
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}

      {currentView === 'home' && (
        <>
          {/* Section: Home (Hero Landing Page Overlay) */}
          <section id="home" ref={homeRef} className="section-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="section-content">
              <div className="about-section-grid fade-in-card" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '50px', alignItems: 'center' }}>
                
                {/* Text Copy Column */}
                <div className="about-text-side">
                  <div className="motto-tag" style={{ 
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--accent-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em',
                    marginBottom: '15px',
                    textShadow: '0 0 10px rgba(0, 242, 254, 0.3)'
                  }}>
                    "Learning through Indulgence"
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', lineHeight: '1.2', background: 'linear-gradient(135deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
                    Welcome to EduSphere
                  </h1>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '30px' }}>
                    An immersive academic classroom designed for curious minds. Track credits, manage courses, and dive into interactive quizzes in a next-gen digital experience.
                  </p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="login-btn" style={{ padding: '12px 30px', fontSize: '0.9rem' }} onClick={() => setCurrentView('login')}>
                      Enter Portal
                    </button>
                    <button className="filter-pill" style={{ padding: '12px 30px', fontSize: '0.9rem' }} onClick={() => handleScrollToSection('about')}>
                      Learn More
                    </button>
                  </div>
                </div>
                
                {/* Right side placeholder column for the global scrolling robot */}
                <div className="hero-robot-placeholder" style={{ minHeight: '300px' }}></div>

              </div>
            </div>
          </section>

          {/* Section: About Inline Details */}
          <AboutSection sectionRef={aboutRef} />

          {/* Section: Contact Form Registrar Support */}
          <ContactSection sectionRef={contactRef} />
        </>
      )}

      {currentView === 'login' && (
        <LoginView 
          onLoginSuccess={(userData) => {
            setToken(userData.token);
            localStorage.setItem('token', userData.token);
            localStorage.setItem('name', userData.name);
            localStorage.setItem('userType', userData.userType);
            localStorage.setItem('userId', userData.userId);
            setStudentProfile(prev => ({
              ...prev,
              name: userData.name,
              userType: userData.userType,
              userId: userData.userId
            }));
            fetchUserData(userData.token);
            setCurrentView('dashboard');
            triggerToast(`Welcome back, ${userData.name}!`);
          }}
          onBackToHome={() => setCurrentView('home')} 
          onSignUpClick={() => setCurrentView('register')}
        />
      )}

      {currentView === 'register' && (
        <RegisterView 
          onBackToHome={() => setCurrentView('home')} 
          onSignInClick={() => setCurrentView('login')}
        />
      )}

      {currentView === 'dashboard' && (
        studentProfile.userType === 'teacher' ? (
          <TeacherDashboard 
            token={token}
            profile={studentProfile}
            onLogout={handleLogout}
          />
        ) : (
          <Dashboard 
            studentProfile={studentProfile}
            courses={courses}
            enrolledIds={enrolledIds}
            onNavigateToWorkspace={handleNavigateToWorkspace}
            onNavigateToCatalog={() => setCurrentView('catalog')}
            onEnroll={handleEnroll}
            onDrop={handleDrop}
          />
        )
      )}

      {currentView === 'catalog' && (
        <CourseCatalog 
          courses={courses}
          enrolledIds={enrolledIds}
          onEnroll={handleEnroll}
          onDrop={handleDrop}
          creditsLimit={studentProfile.creditsLimit}
          currentCredits={currentCredits}
        />
      )}

      {currentView === 'workspace' && (
        <CourseWorkspace 
          course={activeCourseDetails || activeCourse}
          studentProfile={studentProfile}
          onCompleteModule={handleCompleteModule}
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {/* Warning/Success Toast notification */}
      <div className={`warning-toast ${toast.show ? 'visible' : ''}`}>
        {toast.message}
      </div>
    </>
  );
}
