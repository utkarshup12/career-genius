import React, { useState } from 'react';
import { AchievementBadge } from '../types/index.ts';
import {
  Trophy,
  Award,
  Share2,
  CheckCircle2,
  ListTodo,
  GraduationCap,
  Sparkles,
  Lock,
  ChevronRight,
  ShieldAlert,
  Flame,
  Info,
} from 'lucide-react';

interface AchievementsShowcaseProps {
  badges: AchievementBadge[];
  onNavigate?: (tab: string) => void;
}

export const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({
  badges,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'locked') return !b.isUnlocked;
    return true;
  });

  const getBadgeIcon = (iconName: string, isUnlocked: boolean, rarity: string) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-white' : 'text-slate-400'}`;

    let bgStyle = 'bg-slate-200 text-slate-500';
    if (isUnlocked) {
      if (rarity === 'Legendary') {
        bgStyle = 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-amber-500/20 shadow-md';
      } else if (rarity === 'Epic') {
        bgStyle = 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 shadow-indigo-500/20 shadow-md';
      } else if (rarity === 'Rare') {
        bgStyle = 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-md';
      } else {
        bgStyle = 'bg-slate-900 shadow-slate-900/20 shadow-md';
      }
    }

    return (
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${bgStyle}`}>
        {iconName === 'Trophy' && <Trophy className={iconClass} />}
        {iconName === 'Award' && <Award className={iconClass} />}
        {iconName === 'Share2' && <Share2 className={iconClass} />}
        {iconName === 'CheckCircle2' && <CheckCircle2 className={iconClass} />}
        {iconName === 'ListTodo' && <ListTodo className={iconClass} />}
        {iconName === 'GraduationCap' && <GraduationCap className={iconClass} />}
      </div>
    );
  };

  const getRarityTag = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Epic':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Rare':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-0.5">
            <Trophy className="w-4 h-4" />
            <span>Profile Badges & Verified Honors</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Earned Milestones & Achievements
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visual badges awarded automatically as you achieve platform benchmarks, contribute to community resources, and finish courses.
          </p>
        </div>

        {/* Filter Tabs & Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 tabular-nums">
            {unlockedCount} / {totalCount} Unlocked
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'unlocked' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Earned ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'locked' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isSelected = selectedBadge?.id === badge.id;

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                badge.isUnlocked
                  ? isSelected
                    ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {getBadgeIcon(badge.iconName, badge.isUnlocked, badge.rarity)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {badge.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider ${getRarityTag(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress or Unlock Status */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-emerald-700 font-medium text-[11px]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unlocked & Active</span>
                    </span>
                    {badge.unlockedAt && (
                      <span className="text-slate-400 font-normal">Earned {badge.unlockedAt}</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>In Progress</span>
                      </span>
                      {badge.progress && (
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {badge.progress.current} / {badge.progress.max} {badge.progress.unit}
                        </span>
                      )}
                    </div>
                    {badge.progress && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((badge.progress.current / badge.progress.max) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Badge Inspection
              </span>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              {getBadgeIcon(selectedBadge.iconName, selectedBadge.isUnlocked, selectedBadge.rarity)}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedBadge.title}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRarityTag(
                      selectedBadge.rarity
                    )}`}
                  >
                    {selectedBadge.rarity}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Category: {selectedBadge.category.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {selectedBadge.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Unlock Status:</span>
                <strong className={selectedBadge.isUnlocked ? 'text-emerald-600' : 'text-slate-600'}>
                  {selectedBadge.isUnlocked ? 'Unlocked on Profile' : 'Requirements Not Yet Met'}
                </strong>
              </div>

              {selectedBadge.progress && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Current Metric:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {selectedBadge.progress.current} / {selectedBadge.progress.max} {selectedBadge.progress.unit}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
