import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  db,
  doc,
  getDoc,
  setDoc,
  handleFirestoreError,
  OperationType,
  BOOTSTRAP_ADMIN_EMAIL,
} from '../firebase.ts';
import { UserProfile } from '../types/index.ts';
import {
  GraduationCap,
  Shield,
  Sparkles,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  Building2,
  Briefcase,
  AlertCircle,
  LogOut,
  UserCheck,
  Zap,
} from 'lucide-react';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  initialRole?: 'student' | 'teacher' | 'admin';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onClose,
  initialRole = 'student',
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'owner'>(
    initialRole === 'admin' ? 'owner' : initialRole === 'teacher' ? 'teacher' : 'student'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'prompt' | 'complete_profile'>('prompt');

  // Pending user data from Google auth
  const [googleUser, setGoogleUser] = useState<{
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null>(null);

  // Student Profile Form state
  const [name, setName] = useState('');
  const [cgpa, setCgpa] = useState<number>(9.0);
  const [college, setCollege] = useState('Indian Institute of Technology, Delhi');
  const [areaOfInterest, setAreaOfInterest] = useState('Software Developer');
  const [graduationYear, setGraduationYear] = useState<number>(2026);

  const careerTracks = [
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'AI / ML Engineer',
    'DevOps & Cloud Engineer',
    'Full Stack Web Architect',
    'Data Structures & Algorithms Specialist',
  ];

  // Initiate Google Sign-In
  const handleGoogleSignIn = async (desiredRole: 'student' | 'admin' = activeTab === 'owner' ? 'admin' : 'student') => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error('Google account must have an associated email address.');
      }

      setGoogleUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      // Check if user record already exists in Firestore database
      let userDocData: any = null;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          userDocData = docSnap.data();
        }
      } catch (err: any) {
        console.warn('Could not fetch existing Firestore user document, proceeding with profile registration:', err);
      }

      const isOwner = user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (userDocData) {
        // User is already registered in database!
        const profile: UserProfile = {
          id: user.uid,
          name: userDocData.name || user.displayName || 'Student Candidate',
          email: user.email,
          role: isOwner ? 'admin' : (userDocData.role || 'student'),
          cgpa: userDocData.cgpa ?? 8.5,
          areaOfInterest: userDocData.areaOfInterest || 'Software Developer',
          college: userDocData.college || 'National Engineering Institute',
          graduationYear: userDocData.graduationYear || 2026,
          points: userDocData.points ?? 1200,
          rank: userDocData.rank ?? 1,
          weeklyActivity: userDocData.weeklyActivity || [
            { day: 'Mon', studyHours: 3.5, score: 180 },
            { day: 'Tue', studyHours: 4.0, score: 220 },
            { day: 'Wed', studyHours: 3.0, score: 150 },
            { day: 'Thu', studyHours: 4.5, score: 260 },
            { day: 'Fri', studyHours: 3.0, score: 170 },
            { day: 'Sat', studyHours: 5.5, score: 350 },
            { day: 'Sun', studyHours: 4.0, score: 210 },
          ],
          completedCourseIds: userDocData.completedCourseIds || [],
          completedTaskIds: userDocData.completedTaskIds || [],
          bookmarkedResourceIds: userDocData.bookmarkedResourceIds || [],
          assessmentScores: userDocData.assessmentScores || [],
          badges: userDocData.badges || [],
        };

        // Sync with server session
        await fetch('/api/user/sync-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });

        onLoginSuccess(profile);
      } else {
        // New user: if owner, automatically grant admin; else prompt to finish student profile
        if (isOwner) {
          const ownerProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'Utkarsh (Website Owner)',
            email: user.email,
            role: 'admin',
            cgpa: 9.5,
            areaOfInterest: 'Full Stack Web Architect',
            college: 'National Institute of Technology',
            graduationYear: 2026,
            points: 2500,
            rank: 1,
            weeklyActivity: [],
            completedCourseIds: [],
            completedTaskIds: [],
            assessmentScores: [],
            badges: [],
          };

          try {
            await setDoc(doc(db, 'users', user.uid), {
              ...ownerProfile,
              createdAt: new Date().toISOString(),
            });
          } catch (dbErr) {
            console.warn('Firestore setDoc caught for owner:', dbErr);
          }

          await fetch('/api/user/sync-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ownerProfile),
          });

          onLoginSuccess(ownerProfile);
        } else {
          setName(user.displayName || '');
          setStep('complete_profile');
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Failed to authenticate via Google.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Student Profile Registration
  const handleCompleteStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !googleUser.email) return;

    if (!name.trim()) {
      setError('Please provide your full student name.');
      return;
    }

    if (cgpa < 0 || cgpa > 10) {
      setError('CGPA must be a decimal between 0.0 and 10.0.');
      return;
    }

    setLoading(true);
    setError(null);

    const isOwner = googleUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    const newStudentProfile: UserProfile = {
      id: googleUser.uid,
      name: name.trim(),
      email: googleUser.email,
      role: isOwner ? 'admin' : 'student',
      cgpa: Number(cgpa.toFixed(2)),
      areaOfInterest,
      college: college.trim() || 'National Engineering Institute',
      graduationYear: Number(graduationYear),
      points: 1000,
      rank: 1,
      weeklyActivity: [
        { day: 'Mon', studyHours: 3.0, score: 150 },
        { day: 'Tue', studyHours: 4.0, score: 200 },
        { day: 'Wed', studyHours: 2.5, score: 110 },
        { day: 'Thu', studyHours: 3.5, score: 180 },
        { day: 'Fri', studyHours: 3.0, score: 160 },
        { day: 'Sat', studyHours: 5.0, score: 320 },
        { day: 'Sun', studyHours: 3.5, score: 190 },
      ],
      completedCourseIds: [],
      completedTaskIds: [],
      bookmarkedResourceIds: [],
      assessmentScores: [],
      badges: [],
    };

    try {
      // 1. Save directly to Cloud Firestore database
      const userRef = doc(db, 'users', googleUser.uid);
      try {
        await setDoc(userRef, {
          ...newStudentProfile,
          createdAt: new Date().toISOString(),
          photoURL: googleUser.photoURL || '',
        });
      } catch (dbErr) {
        console.warn('Firestore setDoc caught, syncing to backend session:', dbErr);
      }

      // 2. Synchronize with backend server session and cohort registry
      const syncRes = await fetch('/api/user/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentProfile),
      });

      const syncData = await syncRes.json();
      if (!syncData.success) {
        throw new Error(syncData.error || 'Failed to sync student session.');
      }

      onLoginSuccess(newStudentProfile);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Owner demo sign-in (for testing convenience)
  const handleDirectOwnerLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerProfile: UserProfile = {
        id: 'usr-owner-uutkarsh',
        name: 'Utkarsh (Website Owner)',
        email: BOOTSTRAP_ADMIN_EMAIL,
        role: 'admin',
        cgpa: 9.8,
        areaOfInterest: 'Full Stack Web Architect',
        college: 'National Institute of Technology',
        graduationYear: 2026,
        points: 2500,
        rank: 1,
        weeklyActivity: [
          { day: 'Mon', studyHours: 4.0, score: 250 },
          { day: 'Tue', studyHours: 5.0, score: 300 },
          { day: 'Wed', studyHours: 4.5, score: 280 },
          { day: 'Thu', studyHours: 5.5, score: 350 },
          { day: 'Fri', studyHours: 4.0, score: 260 },
          { day: 'Sat', studyHours: 6.0, score: 400 },
          { day: 'Sun', studyHours: 5.0, score: 320 },
        ],
        completedCourseIds: ['course-be', 'course-ai'],
        completedTaskIds: ['task-1', 'task-2'],
        bookmarkedResourceIds: ['res-1'],
        assessmentScores: [],
        badges: [],
        photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces',
      };

      await fetch('/api/user/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerProfile),
      });

      onLoginSuccess(ownerProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as owner.');
    } finally {
      setLoading(false);
    }
  };

  // Teacher Login Form State
  const [customTeacherName, setCustomTeacherName] = useState('');
  const [customTeacherEmail, setCustomTeacherEmail] = useState('');
  const [customTeacherDept, setCustomTeacherDept] = useState('Department of Computer Science & Systems');
  const [customTeacherSpec, setCustomTeacherSpec] = useState('Distributed Systems & Architecture');

  // Teacher Login Handler
  const handleTeacherLogin = async (teacherId?: string, tName?: string, tEmail?: string, tDept?: string, tSpec?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          name: tName || customTeacherName,
          email: tEmail || customTeacherEmail,
          department: tDept || customTeacherDept,
          specialization: tSpec || customTeacherSpec,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        throw new Error(data.error || 'Failed to authenticate teacher.');
      }
    } catch (err: any) {
      setError(err.message || 'Teacher login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Student Testing Profile
  const handleQuickStudentLogin = async (
    studentName: string,
    studentEmail: string,
    studentCgpa: number,
    studentCollege: string,
    studentTrack: string,
    photoURL?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        name: studentName,
        email: studentEmail,
        role: 'student',
        cgpa: studentCgpa,
        areaOfInterest: studentTrack,
        college: studentCollege,
        graduationYear: 2026,
        points: 1200,
        rank: 1,
        weeklyActivity: [
          { day: 'Mon', studyHours: 3.5, score: 180 },
          { day: 'Tue', studyHours: 4.0, score: 220 },
          { day: 'Wed', studyHours: 3.0, score: 150 },
          { day: 'Thu', studyHours: 4.5, score: 260 },
          { day: 'Fri', studyHours: 3.0, score: 170 },
          { day: 'Sat', studyHours: 5.5, score: 350 },
          { day: 'Sun', studyHours: 4.0, score: 210 },
        ],
        completedCourseIds: [],
        completedTaskIds: [],
        bookmarkedResourceIds: [],
        assessmentScores: [],
        badges: [],
        photoURL: photoURL || '',
      };

      await fetch('/api/user/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
      {/* Top Header & Portal Selector */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Verified Authentication Gateway
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeTab === 'owner'
                ? 'Website Owner & Admin Access'
                : activeTab === 'teacher'
                ? 'Faculty & Teacher Portal'
                : 'Student Sign-In & Registration'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {activeTab === 'owner'
                ? `Authorized administrator control portal for ${BOOTSTRAP_ADMIN_EMAIL}`
                : activeTab === 'teacher'
                ? 'Sign in as university faculty to resolve student doubts, share verified solutions, and author performance feedback.'
                : 'Sign in with Google to benchmark skills and store progress in the database.'}
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl shrink-0 self-start sm:self-auto border border-slate-700">
            <button
              onClick={() => {
                setActiveTab('student');
                setStep('prompt');
                setError(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('teacher');
                setStep('prompt');
                setError(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'teacher'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Faculty & Teacher</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('owner');
                setStep('prompt');
                setError(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'owner'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Website Owner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Authentication Notice</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: STUDENT PORTAL
        ======================================================== */}
        {activeTab === 'student' && (
          <>
            {step === 'prompt' ? (
              <div className="space-y-8">
                {/* Google Sign-In Primary Action */}
                <div className="text-center max-w-md mx-auto space-y-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Sign in with Google Account
                    </h3>
                    <p className="text-xs text-slate-600">
                      Connect your Google or university email to securely store test scores, CGPA, and milestone badges.
                    </p>
                  </div>

                  <button
                    onClick={() => handleGoogleSignIn('student')}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>One-Click Popup Sign-In</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-sky-600" />
                      <span>Firestore Sync</span>
                    </span>
                  </div>
                </div>

                {/* Quick Student Test Accounts */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Quick Student Testing Profiles
                    </span>
                    <span className="text-[11px] text-slate-500">Instant one-click demo profiles</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() =>
                        handleQuickStudentLogin(
                          'Vaibhav Singh',
                          'vaibhav.student@iitb.ac.in',
                          9.2,
                          'Indian Institute of Technology, Bombay',
                          'AI / ML Engineer',
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces'
                        )
                      }
                      disabled={loading}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces"
                          alt="Vaibhav"
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Vaibhav Singh</div>
                          <div className="text-[11px] text-slate-500">IIT Bombay · 9.20 CGPA</div>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">AI / ML Engineer Track</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>

                    <button
                      onClick={() =>
                        handleQuickStudentLogin(
                          'Yuvaraj Singh',
                          'yuvaraj.student@bits.ac.in',
                          8.85,
                          'BITS Pilani',
                          'Backend Developer',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
                        )
                      }
                      disabled={loading}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                          alt="Yuvaraj"
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Yuvaraj Singh</div>
                          <div className="text-[11px] text-slate-500">BITS Pilani · 8.85 CGPA</div>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Backend Developer Track</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>

                    <button
                      onClick={() =>
                        handleQuickStudentLogin(
                          'Himanshu Vishwakarma',
                          'himanshu.student@nitt.ac.in',
                          9.1,
                          'National Institute of Technology, Trichy',
                          'Full Stack Web Architect',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
                        )
                      }
                      disabled={loading}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                          alt="Himanshu"
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Himanshu Vishwakarma</div>
                          <div className="text-[11px] text-slate-500">NIT Trichy · 9.10 CGPA</div>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Full Stack Web Architect</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Complete Student Profile */
              <form onSubmit={handleCompleteStudentRegistration} className="space-y-6 max-w-xl mx-auto">
                <div className="text-center space-y-1 pb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Step 2 of 2 · Academic Profile Setup
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Complete Your Student Credentials
                  </h3>
                  <p className="text-xs text-slate-600">
                    Signing up as <strong className="text-slate-900">{googleUser?.email}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vaibhav Singh"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Current CGPA (0.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white tabular-nums"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Graduation Year</label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                      <option value={2029}>2029</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">College / University</label>
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology, Bombay"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Target Career Track</label>
                    <select
                      value={areaOfInterest}
                      onChange={(e) => setAreaOfInterest(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white font-medium"
                    >
                      {careerTracks.map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('prompt')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Creating Profile...' : 'Complete Registration & Enter'}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ========================================================
            TAB 2: FACULTY & TEACHER PORTAL
        ======================================================== */}
        {activeTab === 'teacher' && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Faculty & Instructor Portal</h3>
                  <p className="text-xs text-indigo-900 font-medium">
                    Verified university instructors can publish verified solutions, attach resources, and evaluate students.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Faculty Profiles */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Verified Faculty Member (Instant Access)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleTeacherLogin('tch-1')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/40 text-left transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=faces"
                      alt="Sachin Yadav sir"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Sachin Yadav sir</div>
                      <div className="text-[11px] text-slate-500">CS & Systems</div>
                      <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">Distributed Systems & Databases</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherLogin('tch-2')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/40 text-left transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                      alt="Deep singh sir"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Deep singh sir</div>
                      <div className="text-[11px] text-slate-500">Software Systems</div>
                      <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">Frontend & React 19</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherLogin('tch-3')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/40 text-left transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
                      alt="Himanshu Dubey sir"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Himanshu Dubey sir</div>
                      <div className="text-[11px] text-slate-500">Cloud Infrastructure</div>
                      <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">DevOps & Microservices</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherLogin('tch-4')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/40 text-left transition-all shadow-xs flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
                      alt="Nikita mam"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Nikita mam</div>
                      <div className="text-[11px] text-slate-500">AI & Data Science</div>
                      <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">Deep Learning & NLP</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Teacher Sign-In */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                Or Enter Custom Faculty Credentials
              </span>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Faculty Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={customTeacherName}
                      onChange={(e) => setCustomTeacherName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      placeholder="ramesh.kumar@faculty.university.edu"
                      value={customTeacherEmail}
                      onChange={(e) => setCustomTeacherEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTeacherLogin()}
                  disabled={loading || !customTeacherName.trim() || !customTeacherEmail.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In as Faculty Member'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: WEBSITE OWNER & ADMIN PORTAL
        ======================================================== */}
        {activeTab === 'owner' && (
          <div className="space-y-6 max-w-lg mx-auto py-2">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Website Owner Identity</h3>
                  <div className="font-mono text-xs text-amber-900 font-bold">
                    {BOOTSTRAP_ADMIN_EMAIL}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                As the designated owner of Career Genius, you hold master administrative privileges:
                inspect and edit all registered students, manage curriculum questions and roadmaps,
                and publish the live website link for PC, laptop, and mobile devices.
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Sign-In with Owner Email */}
              <button
                onClick={() => handleGoogleSignIn('admin')}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google ({BOOTSTRAP_ADMIN_EMAIL})</span>
              </button>

              {/* Instant Owner Demo Login */}
              <button
                onClick={handleDirectOwnerLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-slate-900" />
                <span>Instant Sign-In as Owner ({BOOTSTRAP_ADMIN_EMAIL})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
