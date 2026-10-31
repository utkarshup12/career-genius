import React, { useState } from 'react';
import { Calendar, Award, Clock } from 'lucide-react';

interface WeeklyChartProps {
  activity: { day: string; studyHours: number; score: number }[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ activity }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxScore = Math.max(...activity.map((d) => d.score), 100);
  const maxHours = Math.max(...activity.map((d) => d.studyHours), 8);

  const totalWeeklyPoints = activity.reduce((sum, d) => sum + d.score, 0);
  const totalWeeklyHours = activity.reduce((sum, d) => sum + d.studyHours, 0);
  const bestDay = activity.reduce((best, curr) => (curr.score > best.score ? curr : best), activity[0]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Weekly Performance Analytics</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Study Effort & Assessment Points</h3>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block" />
            <span className="text-slate-600 font-medium">XP Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
            <span className="text-slate-600 font-medium">Study Hours</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas / SVG Container */}
      <div className="mt-6 relative">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200">
          {activity.map((item, idx) => {
            const scoreHeight = Math.max(12, Math.round((item.score / maxScore) * 160));
            const hoursHeight = Math.max(8, Math.round((item.studyHours / maxHours) * 160));
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2">
                    <span className="font-bold">{item.day}</span>: {item.score} XP · {item.studyHours}h
                  </div>
                )}

                {/* Paired Bar Columns */}
                <div className="flex items-end gap-1.5 w-full max-w-[48px] justify-center">
                  {/* Score Bar */}
                  <div
                    style={{ height: `${scoreHeight}px` }}
                    className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                      isHovered ? 'bg-indigo-600' : 'bg-slate-900'
                    }`}
                  />
                  {/* Hours Bar */}
                  <div
                    style={{ height: `${hoursHeight}px` }}
                    className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                      isHovered ? 'bg-sky-400' : 'bg-sky-500'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`mt-2 text-xs font-semibold tabular-nums ${
                    isHovered ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Weekly Total Points</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">+{totalWeeklyPoints} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Weekly Study Time</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">{totalWeeklyHours.toFixed(1)} Hours</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Peak Performance Day</span>
            <span className="text-lg font-bold text-slate-900">
              {bestDay?.day} ({bestDay?.score} XP)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
