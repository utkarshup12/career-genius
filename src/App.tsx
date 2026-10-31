/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Assessment,
  Course,
  CareerTask,
  TeacherFeedback,
  PeerMessage,
  PeerSummary,
  SharedResource,
  LeaderboardStudent,
  Subject,
  UserRole,
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AssessmentArena } from './components/AssessmentArena.tsx';
import { CoursesView } from './components/CoursesView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { TeacherFeedbackView } from './components/TeacherFeedbackView.tsx';
import { PeerMessagingView } from './components/PeerMessagingView.tsx';
import { ResourcesTasksView } from './components/ResourcesTasksView.tsx';
import { AdminStudioView } from './components/AdminStudioView.tsx';
import { CareerRoadmapView } from './components/CareerRoadmapView.tsx';
import { AiMentorModal } from './components/AiMentorModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import {
  auth,
  onAuthStateChanged,
  testFirestoreConnection,
  logOutUser,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  doc,
  getDoc,
} from './firebase.ts';
import { Sparkles, CheckCircle2, Lock, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<CareerTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>([]);
  const [feedbacks, setFeedbacks] = useState<TeacherFeedback[]>([]);
  const [cohortStudents, setCohortStudents] = useState<any[]>([]);
  const [peers, setPeers] = useState<PeerSummary[]>([]);
  const [activeThread, setActiveThread] = useState<PeerMessage[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [aiMentorOpen, setAiMentorOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Show transient notification banner
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Test Firestore Connection on boot per Skill instruction
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const isAdminEmail = firebaseUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as any;
            const updatedProfile: UserProfile = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Student',
              email: firebaseUser.email,
              role: isAdminEmail ? 'admin' : (data.role || 'student'),
              cgpa: data.cgpa ?? 8.5,
              areaOfInterest: data.areaOfInterest || 'Software Developer',
              college: data.college || 'National Engineering Institute',
              graduationYear: data.graduationYear || 2026,
              points: data.points ?? 1200,
              rank: data.rank ?? 4,
              weeklyActivity: data.weeklyActivity || [
                { day: 'Mon', studyHours: 3.5, score: 180 },
                { day: 'Tue', studyHours: 4.2, score: 240 },
                { day: 'Wed', studyHours: 2.8, score: 120 },
                { day: 'Thu', studyHours: 5.0, score: 310 },
                { day: 'Fri', studyHours: 3.0, score: 190 },
                { day: 'Sat', studyHours: 6.5, score: 420 },
                { day: 'Sun', studyHours: 4.0, score: 260 },
              ],
              completedCourseIds: data.completedCourseIds || [],
              completedTaskIds: data.completedTaskIds || [],
              bookmarkedResourceIds: data.bookmarkedResourceIds || [],
              assessmentScores: data.assessmentScores || [],
              badges: data.badges || [],
            };

            setCurrentUser(updatedProfile);

            // Sync with server session
            await fetch('/api/user/sync-google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedProfile),
            });
          }
        } catch (err) {
          console.warn('Failed to fetch user doc on auth state change:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load initial data from backend
  const loadAllData = async () => {
    try {
      const [uRes, sRes, aRes, cRes, tRes, lRes, fRes, mRes, rRes] = await Promise.all([
        fetch('/api/user').then((r) => r.json()),
        fetch('/api/subjects').then((r) => r.json()),
        fetch('/api/assessments').then((r) => r.json()),
        fetch('/api/courses').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/leaderboard').then((r) => r.json()),
        fetch('/api/feedback').then((r) => r.json()),
        fetch('/api/messages').then((r) => r.json()),
        fetch('/api/resources').then((r) => r.json()),
      ]);

      if (uRes.success) setCurrentUser(uRes.user);
      if (sRes.success) setSubjects(sRes.subjects);
      if (aRes.success) setAssessments(aRes.assessments);
      if (cRes.success) setCourses(cRes.courses);
      if (tRes.success) setTasks(tRes.tasks);
      if (lRes.success) setLeaderboard(lRes.leaderboard);
      if (fRes.success) {
        setFeedbacks(fRes.feedback);
        if (fRes.allStudents) setCohortStudents(fRes.allStudents);
      }
      if (mRes.success) {
        setPeers(mRes.peers);
        setActiveThread(mRes.activeThread);
        if (mRes.peers.length > 0 && !selectedPeerId) {
          setSelectedPeerId(mRes.peers[0].id);
        }
      }
      if (rRes.success) setResources(rRes.resources);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (userProfile: UserProfile) => {
    setCurrentUser(userProfile);
    setLoginModalOpen(false);
    triggerNotification(`Authenticated as ${userProfile.name} (${userProfile.role.toUpperCase()})`);

    // Reload cohort & feedback data
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLeaderboard(data.leaderboard);
      });
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logOutUser();
      triggerNotification('Signed out from Google session.');
      // Switch back to standard student persona
      handleSwitchRole('student');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Handle Role Switch
  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/user/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        triggerNotification(`Active persona switched to ${role.toUpperCase()}`);
        if (role !== 'admin' && activeTab === 'admin') {
          setActiveTab('dashboard');
        }
        // Reload feedback since role changes what is visible
        const fRes = await fetch('/api/feedback').then((r) => r.json());
        if (fRes.success) {
          setFeedbacks(fRes.feedback);
          if (fRes.allStudents) setCohortStudents(fRes.allStudents);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        triggerNotification('Profile details updated successfully');
        // Refresh leaderboard to reflect CGPA/track changes
        const lRes = await fetch('/api/leaderboard').then((r) => r.json());
        if (lRes.success) setLeaderboard(lRes.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Assessment Submission
  const handleSubmitAssessment = async (assessmentId: string, answers: Record<string, number>) => {
    const res = await fetch('/api/assessments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, answers }),
    });
    const data = await res.json();
    if (data.success) {
      triggerNotification(`Assessment completed! +${data.earnedPoints} XP awarded`);
      // Update local user points & rank
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          points: data.newTotalPoints,
          rank: data.newRank,
        });
      }
      // Refresh leaderboard
      const lRes = await fetch('/api/leaderboard').then((r) => r.json());
      if (lRes.success) setLeaderboard(lRes.leaderboard);
    }
    return data;
  };

  // Handle Course Completion
  const handleCompleteCourse = async (courseId: string) => {
    try {
      const res = await fetch('/api/courses/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification('Course completed! +300 XP and Certificate unlocked');
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            completedCourseIds: data.completedCourseIds,
            points: data.newPoints,
          });
        }
        // Refresh leaderboard
        const lRes = await fetch('/api/leaderboard').then((r) => r.json());
        if (lRes.success) setLeaderboard(lRes.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Task Completion Toggle
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (data.success) {
        const isDone = data.completedTaskIds.includes(taskId);
        triggerNotification(isDone ? 'Task marked complete! Points added' : 'Task status updated');
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            completedTaskIds: data.completedTaskIds,
            points: data.newPoints,
            rank: data.newRank,
          });
        }
        const lRes = await fetch('/api/leaderboard').then((r) => r.json());
        if (lRes.success) setLeaderboard(lRes.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Peer Message Send
  const handleSendMessage = async (receiverId: string, content: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveThread((prev) => [...prev, data.message]);
        // Refresh peers list
        const mRes = await fetch(`/api/messages?peerId=${receiverId}`).then((r) => r.json());
        if (mRes.success) setPeers(mRes.peers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Peer Select for Messaging
  const handleSelectPeerForMessage = async (peerId: string) => {
    setSelectedPeerId(peerId);
    setActiveTab('messages');
    try {
      const mRes = await fetch(`/api/messages?peerId=${peerId}`).then((r) => r.json());
      if (mRes.success) {
        setActiveThread(mRes.activeThread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Share Resource
  const handleShareResource = async (newRes: any) => {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRes),
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) => [data.resource, ...prev]);
        triggerNotification('Resource shared with student cohort! +50 Community Points');
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            points: currentUser.points + 50,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Upvote Resource
  const handleUpvoteResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/upvote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, upvotes: data.upvotes, userUpvoted: data.userUpvoted } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Bookmark Resource Toggle
  const handleBookmarkResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, isBookmarked: data.isBookmarked } : r
          )
        );
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            bookmarkedResourceIds: data.bookmarkedResourceIds,
          });
        }
        triggerNotification(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Submit Teacher Feedback
  const handleSubmitTeacherFeedback = async (feedbackData: any) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) => [data.feedback, ...prev]);
        triggerNotification('Faculty evaluation recorded successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Admin Add Question
  const handleAddQuestion = async (qData: any) => {
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qData),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(data.message);
        // Refresh assessments
        const aRes = await fetch('/api/assessments').then((r) => r.json());
        if (aRes.success) setAssessments(aRes.assessments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Admin Add Subject
  const handleAddSubject = async (sData: any) => {
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sData),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(data.message);
        const sRes = await fetch('/api/subjects').then((r) => r.json());
        if (sRes.success) setSubjects(sRes.subjects);
        const aRes = await fetch('/api/assessments').then((r) => r.json());
        if (aRes.success) setAssessments(aRes.assessments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-700">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Initializing Career Genius...</h2>
          <p className="text-xs text-slate-500">Loading student models, assessments & cohort analytics.</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Header strictly following Top Bar Contract & RBAC */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenAiMentor={() => setAiMentorOpen(true)}
        onOpenLogin={() => setLoginModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main View Port Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setActiveTab}
            onOpenAiMentor={() => setAiMentorOpen(true)}
          />
        )}

        {activeTab === 'roadmap' && (
          <CareerRoadmapView
            currentUser={currentUser}
            courses={courses}
            tasks={tasks}
            onNavigate={setActiveTab}
            onOpenAiMentor={() => setAiMentorOpen(true)}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentArena
            assessments={assessments}
            onSubmitAssessment={handleSubmitAssessment}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            currentUser={currentUser}
            onCompleteCourse={handleCompleteCourse}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            students={leaderboard}
            currentUser={currentUser}
            onSelectPeerForMessage={handleSelectPeerForMessage}
          />
        )}

        {activeTab === 'messages' && (
          <PeerMessagingView
            peers={peers}
            activeThread={activeThread}
            currentUser={currentUser}
            selectedPeerId={selectedPeerId}
            onSelectPeer={handleSelectPeerForMessage}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'feedback' && (
          <TeacherFeedbackView
            feedbacks={feedbacks}
            currentUser={currentUser}
            allCohortStudents={cohortStudents}
            onSubmitTeacherFeedback={handleSubmitTeacherFeedback}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesTasksView
            tasks={tasks}
            resources={resources}
            currentUser={currentUser}
            onToggleTask={handleToggleTask}
            onShareResource={handleShareResource}
            onUpvoteResource={handleUpvoteResource}
            onBookmarkResource={handleBookmarkResource}
          />
        )}

        {/* STRICT RBAC: Student Cannot Access Admin Page */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminStudioView
              subjects={subjects}
              assessments={assessments}
              currentUser={currentUser}
              onAddQuestion={handleAddQuestion}
              onAddSubject={handleAddSubject}
            />
          ) : (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm my-8">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Access Denied · RBAC Security Fence
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Administrator Studio Restricted
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
                  Students cannot access the Admin page. Only authorized administrators (such as <code className="font-mono text-slate-900 font-bold">{BOOTSTRAP_ADMIN_EMAIL}</code>) are permitted to inspect registered student databases or author platform questions.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Return to Student Dashboard
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Student Google Login / Sign Up Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute right-4 top-4 z-20 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
              aria-label="Close Login Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <LoginPage
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Gemini AI Career Mentor Modal */}
      <AiMentorModal
        currentUser={currentUser}
        isOpen={aiMentorOpen}
        onClose={() => setAiMentorOpen(false)}
      />

      {/* Minimal Editorial Footer (Anti-Slop: clean copyright, no telemetry engines) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Career Genius</span>
            <span aria-hidden="true">·</span>
            <span>University Student Guidance & Skills Benchmark</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline text-xs font-medium"
            >
              Google Student Sign-In / Register
            </button>
            <span aria-hidden="true">·</span>
            <span>Verified Credentials & Mentorship · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
