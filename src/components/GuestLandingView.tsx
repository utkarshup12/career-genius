import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  ArrowRight,
  Shield,
  BookOpen,
  CheckCircle2,
  Trophy,
  Users,
  Compass,
  FileCheck,
  Zap,
  LogIn,
  Lock,
  Share2,
  Check,
  Smartphone,
  Laptop,
  Monitor,
} from 'lucide-react';
import { Assessment, Subject } from '../types/index.ts';

interface GuestLandingViewProps {
  onOpenLogin: (role?: 'student' | 'admin') => void;
  onNavigate: (tab: string) => void;
  onOpenAiMentor: () => void;
  assessments: Assessment[];
}

export const GuestLandingView: React.FC<GuestLandingViewProps> = ({
  onOpenLogin,
  onNavigate,
  onOpenAiMentor,
  assessments,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const LIVE_URL = 'https://ais-pre-au3avitokhba6nliudiuk7-693060557594.asia-east1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(LIVE_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Student Career Guidance & Benchmarking Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
                Benchmark Your Skills. Architect Your Engineering Career.
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Diagnostic technical assessments, personalized industry roadmaps, accredited skill
                certifications, and verifiable milestone badges. Benchmark your academic standing,
                compete on the cohort leaderboard, and build an exceptional engineering portfolio.
              </p>

              {/* Identity & Cloud Database Assurance */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Google / Gmail Sign-In</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Firestore Cloud Database</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>PC, Laptop & Mobile Ready</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onOpenLogin('student')}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2.5 group"
              >
                {/* Google G logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#1e293b"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#1e293b"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Student Login / Register</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('assessments')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium text-sm rounded-xl transition-colors border border-slate-700 inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Explore Assessments</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm rounded-xl transition-colors border border-slate-700 inline-flex items-center gap-2"
                title="Copy live link for mobile and PC"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-400" />
                    <span>Share Live Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_career_genius_1793426260248.jpg"
              alt="Engineers collaborating in modern campus laboratory"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
          </div>
        </div>
      </div>

      {/* 2. Platform Value Pillars */}
      <div>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Engineered For Student Success
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Career Preparation Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Four pillars designed to transform engineering students into industry-ready software developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Diagnostic Assessments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized multiple-choice examinations across Frontend, Backend, AI/ML, and Algorithms with full question explanations.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-emerald-600">
                4 Specialized Domains Ready
              </span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Career Roadmaps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored milestone progressions matching your target role (AI Engineer, Full-Stack Architect, Cloud/DevOps).
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-sky-600">
                Prerequisite & Deliverable Tracking
              </span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Milestone Badges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn visual achievement badges for Top 10% Rank, Course Expert, and Community Contributor displayed on your public profile.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-amber-600">
                Verifiable Portfolio Badges
              </span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Device Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full responsive access on PC, laptop, tablet, or smartphone. Practice quizzes, view roadmaps, and bookmark resources on any screen.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-purple-600">
                100% Mobile & PC Responsive
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sample Diagnostic Assessment Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verified Testing Modules
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Available Engineering Assessments
            </h2>
            <p className="text-xs text-slate-600">
              Take comprehensive timed benchmarks designed to test real industry engineering patterns.
            </p>
          </div>
          <button
            onClick={() => onNavigate('assessments')}
            className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Assessments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {assessments.slice(0, 4).map((asmt) => (
            <div
              key={asmt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {asmt.difficulty}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {asmt.durationMinutes} Minutes
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {asmt.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {asmt.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {asmt.questions.length} Questions · {asmt.totalMarks} Marks
                </span>
                <button
                  onClick={() => onNavigate('assessments')}
                  className="font-bold text-slate-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Leaderboard & Public Access Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>Competitive Live Cohort Leaderboard</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Real Student Rankings Grounded in Honest Assessment
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All fake mockup students have been completely removed. When students register and complete
            diagnostic assessments, earn course certifications, and solve hands-on practical challenges,
            their dynamic XP points position them in real-time on the global leaderboard.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenLogin('student')}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Register & Claim Rank #1</span>
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors border border-slate-700 inline-flex items-center gap-2"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Multi-Device Link Box */}
        <div className="lg:col-span-5 bg-slate-850 rounded-2xl border border-slate-750 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Public Live Web App
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Online
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Share this URL with classmates, study groups, or open it on your smartphone or laptop:
          </p>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 font-mono text-[11px] text-emerald-400 break-all select-all">
            {LIVE_URL}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleCopy}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-white hover:bg-slate-100 text-slate-950'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied Live Website Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copy Live Link for Mobile / PC</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>PC & Laptop</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile / iOS / Android</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Call to Action */}
      <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8 sm:p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Ready to Claim Your Profile & Verify Your Technical Standing?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Sign up with your Google or Gmail account in under 60 seconds. Your assessment scores, CGPA,
          and unlocked badges sync to your personal Firestore database profile.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onOpenLogin('student')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>
          <button
            onClick={() => onNavigate('roadmap')}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-300"
          >
            <span>Explore Career Roadmaps</span>
          </button>
        </div>
      </div>
    </div>
  );
};
