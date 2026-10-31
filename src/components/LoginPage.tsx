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
} from 'lucide-react';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onClose,
}) => {
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

  // Profile Form state
  const [name, setName] = useState('');
  const [cgpa, setCgpa] = useState<number>(8.5);
  const [college, setCollege] = useState('');
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
  const handleGoogleSignIn = async () => {
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

      const isAdmin = user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (userDocData) {
        // User is already registered in database!
        const profile: UserProfile = {
          id: user.uid,
          name: userDocData.name || user.displayName || 'Student',
          email: user.email,
          role: isAdmin ? 'admin' : (userDocData.role || 'student'),
          cgpa: userDocData.cgpa ?? 8.5,
          areaOfInterest: userDocData.areaOfInterest || 'Software Developer',
          college: userDocData.college || 'National Engineering Institute',
          graduationYear: userDocData.graduationYear || 2026,
          points: userDocData.points ?? 1200,
          rank: userDocData.rank ?? 5,
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
        // New user: Pre-fill and prompt profile completion
        setName(user.displayName || user.email.split('@')[0]);
        setCollege('National Institute of Technology');
        setStep('complete_profile');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'Authentication failed. Please verify your Google account.');
    } finally {
      setLoading(false);
    }
  };

  // Submit complete student registration form
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !googleUser.email) return;

    setLoading(true);
    setError(null);

    const isAdmin = googleUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    const studentRecord = {
      id: googleUser.uid,
      name: name.trim() || 'Student Candidate',
      email: googleUser.email,
      role: isAdmin ? 'admin' : 'student',
      cgpa: Number(cgpa),
      areaOfInterest,
      college: college.trim() || 'National Engineering Institute',
      graduationYear: Number(graduationYear),
      points: 1000,
      rank: 6,
      photoURL: googleUser.photoURL || '',
      createdAt: new Date().toISOString(),
      completedCourseIds: [],
      completedTaskIds: [],
      bookmarkedResourceIds: [],
      assessmentScores: [],
    };

    try {
      // 1. Store in Firestore database
      const userRef = doc(db, 'users', googleUser.uid);
      try {
        await setDoc(userRef, studentRecord, { merge: true });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${googleUser.uid}`);
      }

      // 2. Sync with platform server
      const res = await fetch('/api/user/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentRecord),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        throw new Error(data.error || 'Server session synchronization failed');
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setError(err?.message || 'Failed to complete registration in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setGoogleUser(null);
      setStep('prompt');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner Hero */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-emerald-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Verified Student Identity & Cloud Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {step === 'prompt'
                ? 'Welcome to Career Genius'
                : 'Complete Your Student Profile'}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {step === 'prompt'
                ? 'Sign in or register using your Google or Gmail account. Your academic credentials, CGPA, assessment rankings, and badges are securely stored in the cloud database.'
                : 'Enter your academic details below so we can personalize your career roadmap, benchmark your CGPA, and track your assessment rankings.'}
            </p>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 sm:mx-10 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Authentication / Database Notice: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Google Sign In / Sign Up Prompt */}
        {step === 'prompt' && (
          <div className="p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Column: Sign-In Action */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Student & Faculty Authentication
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click the button below to authenticate with your Google / Gmail account via secure OAuth popup.
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3.5 px-6 py-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 hover:text-slate-900 rounded-2xl font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {/* Google SVG Icon */}
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
                  <span>{loading ? 'Connecting to Google...' : 'Continue with Google / Gmail'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
                </button>

                {/* Privacy & Cloud Storage Assurance */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <span>Database Privacy & Strict Access Policy</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Student profiles are stored in Google Cloud Firestore. Your assessment scores, CGPA, and project deliverables remain strictly private to you and designated faculty evaluators.
                  </p>
                </div>

                {/* Platform Administrator Notice */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Platform Administrator Credentials:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Only authorized administrators (such as <code className="font-mono font-bold text-amber-900">{BOOTSTRAP_ADMIN_EMAIL}</code>) can access the Admin Studio to manage subjects, author questions, and review registered student rosters. Students are barred from administrative functions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Features Highlight */}
              <div className="md:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  What You Unlock As A Student:
                </span>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Skill Diagnostic Assessments</h4>
                      <p className="text-slate-500 text-[11px]">
                        Algorithmic evaluations across Frontend, Backend, DSA, and AI tracks to determine your platform rank.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Career Roadmap & Milestone Badges</h4>
                      <p className="text-slate-500 text-[11px]">
                        Earn visual achievement badges like &quot;Top 10% Rank&quot;, &quot;Course Expert&quot;, and &quot;Task Master&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Cohort Ranking & Peer Networking</h4>
                      <p className="text-slate-500 text-[11px]">
                        Compete on the weekly leaderboard, exchange technical notes, and receive personalized faculty feedback.
                      </p>
                    </div>
                  </div>
                </div>

                {onClose && (
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Continue browsing as Guest Explorer →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Complete Student Profile (First-Time Registration) */}
        {step === 'complete_profile' && (
          <form onSubmit={handleCompleteRegistration} className="p-8 sm:p-10 space-y-6 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">Google Account Verified!</p>
                <p className="text-[11px] text-emerald-700">
                  Signed in as <span className="font-semibold">{googleUser?.email}</span>. Fill out your student details below to finalize database registration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              {/* Verified Gmail (Read Only) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Verified Google Email</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Linked</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={googleUser?.email || ''}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-xs font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* CGPA */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Academic CGPA (Out of 10.0)</span>
                  <span className="text-[10px] text-slate-400">Scale 0.0 - 10.0</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium"
                />
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Expected Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                >
                  <option value={2025}>2025 (Graduating)</option>
                  <option value={2026}>2026 (Final Year)</option>
                  <option value={2027}>2027 (Pre-final Year)</option>
                  <option value={2028}>2028 (Sophomore)</option>
                  <option value={2029}>2029 (Freshman)</option>
                </select>
              </div>

              {/* College / University */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  College / University / Technical Institute
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. National Institute of Technology, Trichy"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs pl-9"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Area of Interest / Target Role */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Target Career Track / Area of Interest
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {careerTracks.map((track) => {
                    const isSelected = areaOfInterest === track;
                    return (
                      <button
                        type="button"
                        key={track}
                        onClick={() => setAreaOfInterest(track)}
                        className={`px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        {track}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Google Account</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Storing Profile in Database...' : 'Finalize Registration & Enter Platform'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
