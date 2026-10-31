import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { WeeklyChart } from './WeeklyChart.tsx';
import { AchievementsShowcase } from './AchievementsShowcase.tsx';
import { calculateDomainReadiness } from '../utils/careerLogic.ts';
import {
  Trophy,
  GraduationCap,
  Target,
  Flame,
  ArrowRight,
  Edit3,
  BookOpen,
  CheckCircle2,
  Sparkles,
  MessageSquareQuote,
  Building2,
  Calendar,
  Compass,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onNavigate: (tab: string) => void;
  onOpenAiMentor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onUpdateProfile,
  onNavigate,
  onOpenAiMentor,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    cgpa: currentUser.cgpa,
    areaOfInterest: currentUser.areaOfInterest,
    college: currentUser.college,
    graduationYear: currentUser.graduationYear,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Compute domain readiness
  const avgAsmtScore =
    currentUser.assessmentScores.length > 0
      ? currentUser.assessmentScores.reduce((sum, s) => sum + s.percentage, 0) / currentUser.assessmentScores.length
      : 75;

  const readiness = calculateDomainReadiness(
    currentUser.cgpa,
    avgAsmtScore,
    currentUser.completedTaskIds.length
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    await onUpdateProfile({
      name: formData.name,
      cgpa: Number(formData.cgpa),
      areaOfInterest: formData.areaOfInterest,
      college: formData.college,
      graduationYear: Number(formData.graduationYear),
    });
    setSaveLoading(false);
    setIsEditingProfile(false);
  };

  const domainOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Software Developer',
    'Full Stack Engineer',
    'AI / ML Engineer',
    'DevOps & Cloud',
    'Data Scientist',
    'Mobile Application Developer',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                <span>Personalized Career Guidance Engine</span>
                <span aria-hidden="true">·</span>
                <span>Cohort 2026</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
                Welcome back, {currentUser.name}
              </h1>

              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                You are currently tracking for <strong className="text-white font-semibold">{currentUser.areaOfInterest}</strong>.
                Your current CGPA is <strong className="text-white font-semibold">{currentUser.cgpa.toFixed(2)}</strong> at{' '}
                <span className="text-slate-200">{currentUser.college}</span>. Keep sharpening your skills with domain assessments and practical challenges.
              </p>

              {/* Profile Earned Badges Strip */}
              {currentUser.badges && currentUser.badges.filter((b) => b.isUnlocked).length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Active Honors:
                  </span>
                  {currentUser.badges
                    .filter((b) => b.isUnlocked)
                    .map((badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 text-amber-300 border border-amber-400/30 shadow-xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{badge.title}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('roadmap')}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Career Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('assessments')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-700 inline-flex items-center gap-2"
              >
                <span>Take Skill Assessment</span>
              </button>

              <button
                onClick={onOpenAiMentor}
                className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors border border-slate-700 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Mentor</span>
              </button>

              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-3 py-2.5 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_career_genius_1793426260248.jpg"
              alt="Students collaborating on career guidance in high tech studio"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CGPA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Current CGPA</span>
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {currentUser.cgpa.toFixed(2)}
              <span className="text-sm font-medium text-slate-400 ml-1">/ 10.0</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{currentUser.college}</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Metric 2: Platform Rank */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Rank</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              #{currentUser.rank}
              <span className="text-sm font-medium text-slate-400 ml-1">of 1,280</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Top {Math.max(1, Math.round((currentUser.rank / 1280) * 100))}% Percentile</span>
              <button
                onClick={() => onNavigate('leaderboard')}
                className="text-slate-900 hover:underline font-semibold"
              >
                View Board
              </button>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Points */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform XP</span>
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {currentUser.points}
              <span className="text-sm font-medium text-slate-400 ml-1">XP</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <span>Earned via tests, courses & tasks</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Career Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Role Readiness</span>
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{readiness.percentage}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {readiness.tier}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readiness.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Performance Chart & Career Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Weekly Performance Bar Chart & Badges Showcase */}
        <div className="lg:col-span-8 space-y-8">
          <WeeklyChart activity={currentUser.weeklyActivity} />

          {/* Student Milestone Achievements & Visual Badges */}
          <AchievementsShowcase badges={currentUser.badges || []} onNavigate={onNavigate} />

          {/* Recent Assessments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Skill Assessments</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized tests verifying your domain algorithms and architectural precision.
                </p>
              </div>
              <button
                onClick={() => onNavigate('assessments')}
                className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
              >
                <span>Take Another Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {currentUser.assessmentScores.map((asmt) => (
                <div key={asmt.assessmentId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{asmt.subjectTitle}</h4>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Verified Test</span>
                        <span aria-hidden="true">·</span>
                        <span>Completed on {asmt.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <div className="text-base font-bold text-slate-900 tabular-nums">
                        {asmt.score} / {asmt.maxScore}
                      </div>
                      <div className="text-xs font-medium text-emerald-600 tabular-nums">
                        {asmt.percentage}% Score
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Track & Milestone Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Track Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Role
              </span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{currentUser.areaOfInterest}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Curated learning roadmap based on university placement criteria and industry hiring patterns.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Completed Tasks</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {currentUser.completedTaskIds.length} / 5
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Accredited Courses</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {currentUser.completedCourseIds.length} / 3
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Assessments Passed</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {currentUser.assessmentScores.length} Tests
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('roadmap')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>View Career Track Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Accredited Courses</span>
              </button>
            </div>
          </div>

          {/* Teacher Feedback Callout */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <MessageSquareQuote className="w-4 h-4" />
              <span>Teacher Review Available</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Faculty mentors have reviewed your recent coding deliverables and assessment results.
            </p>
            <button
              onClick={() => onNavigate('feedback')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Read Mentor Evaluation & Action Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Peer Collaboration Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peer Network</span>
              <span className="text-xs text-emerald-600 font-medium">5 Peers Online</span>
            </div>
            <p className="text-xs text-slate-600">
              Discuss interview questions, share GitHub repos, and prep together with top cohort peers.
            </p>
            <button
              onClick={() => onNavigate('messages')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors"
            >
              Open Direct Messages
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Update Student Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area of Interest / Target Role
                </label>
                <select
                  value={formData.areaOfInterest}
                  onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {domainOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
