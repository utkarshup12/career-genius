import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types/index.ts';
import { BOOTSTRAP_ADMIN_EMAIL } from '../firebase.ts';
import {
  Sparkles,
  Menu,
  X,
  Shield,
  GraduationCap,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Share2,
  Check,
  Smartphone,
  Laptop,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onSwitchRole: (role: UserRole) => void;
  onOpenAiMentor: () => void;
  onOpenLogin: (role?: 'student' | 'admin') => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onOpenAiMentor,
  onOpenLogin,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const LIVE_URL = 'https://ais-pre-au3avitokhba6nliudiuk7-693060557594.asia-east1.run.app';

  const isOwner =
    currentUser !== null &&
    currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  const isAdmin = isOwner || (currentUser !== null && currentUser.role === 'admin');

  // STRICT RBAC:
  // Students & Guests do NOT see Admin Studio
  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'courses', label: 'Courses & Certs' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'messages', label: 'Peer Network' },
    { id: 'resources', label: 'Resources & Tasks' },
  ];

  // Only website owner/admins see the Admin Studio
  const navItems = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Owner & Admin Studio' }]
    : baseNavItems;

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleCopyLiveLink = () => {
    navigator.clipboard.writeText(LIVE_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
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
          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isSpecialAdmin = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm py-1 border-b-2 font-medium flex items-center gap-1.5 ${
                    isActive
                      ? 'border-slate-900 text-slate-900 font-semibold'
                      : isSpecialAdmin
                      ? 'border-transparent text-rose-600 hover:text-rose-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSpecialAdmin && <Shield className="w-3.5 h-3.5 text-rose-600" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Account Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Website Sharing Button (Accessible for everyone on PC / Laptop / Mobile) */}
            <button
              onClick={handleCopyLiveLink}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
              title="Copy public live website link for PC, laptop, or mobile"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Share Live Site</span>
                  <span className="md:hidden">Share</span>
                </>
              )}
            </button>

            {/* AI Career Assistant Button */}
            <button
              onClick={onOpenAiMentor}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-xs"
              title="Open Gemini AI Career Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Guidance</span>
            </button>

            {/* If NOT logged in (Guest View) */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin('student')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              /* If Logged In: Dynamic User Profile & Menu */
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs ${
                    isOwner
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                  aria-haspopup="true"
                  aria-expanded={roleDropdownOpen}
                >
                  {isOwner ? (
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                  ) : isAdmin ? (
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span className="capitalize font-semibold">
                    {isOwner ? 'Owner' : currentUser.role}
                  </span>
                  <span className="text-slate-500 text-xs font-bold hidden md:inline">
                    · {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-68 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    role="menu"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                          Active Account
                        </span>
                        {isOwner && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            Website Owner
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-xs truncate mt-0.5">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {currentUser.email}
                      </div>
                      {currentUser.role === 'student' && (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                          <span>CGPA: <strong className="text-slate-900">{currentUser.cgpa.toFixed(2)}</strong></span>
                          <span>Points: <strong className="text-emerald-600 font-mono">{currentUser.points} XP</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Owner / Admin Direct Link */}
                    {isAdmin && (
                      <div className="p-2 border-b border-slate-100">
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs bg-slate-900 text-white rounded-xl font-bold flex items-center justify-between hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Owner Studio & Controls</span>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            Manage
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Persona Toggle for Owner */}
                    {isOwner && (
                      <div className="px-3 py-1">
                        <button
                          onClick={() => {
                            onSwitchRole(currentUser.role === 'admin' ? 'student' : 'admin');
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <span className="text-[11px] text-slate-600">
                            View as: <strong>{currentUser.role === 'admin' ? 'Student View' : 'Admin View'}</strong>
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold underline">
                            Toggle
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenLogin('student');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isSpecialAdmin = item.id === 'admin';
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : isSpecialAdmin
                    ? 'text-rose-600 hover:bg-rose-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isSpecialAdmin && <Shield className="w-4 h-4 text-rose-600" />}
                  <span>{item.label}</span>
                </span>
                {isActive && <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Active</span>}
              </button>
            );
          })}

          {/* Quick share live link in mobile menu */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={handleCopyLiveLink}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Live Website Link (Mobile / PC)'}</span>
            </button>

            {!currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin('student');
                }}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login / Sign Up</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.name})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
