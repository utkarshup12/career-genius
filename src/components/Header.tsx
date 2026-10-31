import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types/index.ts';
import { Sparkles, Menu, X, Shield, GraduationCap, UserCheck, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  onSwitchRole: (role: UserRole) => void;
  onOpenAiMentor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onOpenAiMentor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'courses', label: 'Courses & Certs' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'messages', label: 'Peer Network' },
    { id: 'feedback', label: 'Teacher Feedback' },
    { id: 'resources', label: 'Resources & Tasks' },
    { id: 'admin', label: 'Admin Studio' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
              aria-label="Career Genius Home"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                CG
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Career Genius
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Student Guidance & Skill Benchmark
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 text-sm py-1 border-b-2 font-medium ${
                    isActive
                      ? 'border-slate-900 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* AI Career Assistant Button */}
            <button
              onClick={onOpenAiMentor}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-sm"
              title="Open Gemini AI Career Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Guidance</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-800 transition-colors shadow-xs"
                aria-haspopup="true"
                aria-expanded={roleDropdownOpen}
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-rose-600" />
                ) : currentUser.role === 'teacher' ? (
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="capitalize font-semibold">{currentUser.role}</span>
                <span className="text-slate-400 text-[10px] hidden md:inline">({currentUser.name.split(' ')[0]})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                    Switch Active Persona:
                  </div>
                  <button
                    onClick={() => {
                      onSwitchRole('student');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === 'student' ? 'text-slate-900 font-semibold bg-slate-50/60' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-medium">Student Persona</div>
                        <div className="text-[10px] text-slate-500">Aarav Sharma · CGPA 8.8</div>
                      </div>
                    </div>
                    {currentUser.role === 'student' && <span className="text-emerald-600 text-xs font-bold">Active</span>}
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('teacher');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === 'teacher' ? 'text-slate-900 font-semibold bg-slate-50/60' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">Teacher / Faculty</div>
                        <div className="text-[10px] text-slate-500">Prof. Neha Gupta</div>
                      </div>
                    </div>
                    {currentUser.role === 'teacher' && <span className="text-indigo-600 text-xs font-bold">Active</span>}
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.role === 'admin' ? 'text-slate-900 font-semibold bg-slate-50/60' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-medium">Platform Admin</div>
                        <div className="text-[10px] text-slate-500">Add Questions & Subjects</div>
                      </div>
                    </div>
                    {currentUser.role === 'admin' && <span className="text-rose-600 text-xs font-bold">Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
              <button
                onClick={() => {
                  onOpenAiMentor();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-900 bg-slate-100 rounded-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Guidance</span>
              </button>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
