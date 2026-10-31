import React, { useState } from 'react';
import { LeaderboardStudent, UserProfile } from '../types/index.ts';
import {
  Trophy,
  Medal,
  Search,
  MessageSquare,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface LeaderboardViewProps {
  students: LeaderboardStudent[];
  currentUser: UserProfile;
  onSelectPeerForMessage: (peerId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  currentUser,
  onSelectPeerForMessage,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tracks = [
    { id: 'all', label: 'All Tracks' },
    { id: 'Frontend Developer', label: 'Frontend' },
    { id: 'Backend Developer', label: 'Backend' },
    { id: 'AI / ML Engineer', label: 'AI & ML' },
    { id: 'DevOps & Cloud', label: 'Cloud & DevOps' },
    { id: 'Software Developer', label: 'Software Eng' },
  ];

  // Filter students
  const filteredStudents = students
    .filter((s) => {
      const matchTrack = selectedTrack === 'all' || s.areaOfInterest.toLowerCase() === selectedTrack.toLowerCase();
      const matchSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.areaOfInterest.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTrack && matchSearch;
    })
    .sort((a, b) => b.points - a.points);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-300 shadow-xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300 shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-400/40 shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Platform Student Competition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Global Leaderboard & Rank Standings
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Real-time rankings calculated from domain assessments, certified course completions, and practical challenge points.
          </p>
        </div>

        {/* Current user rank summary pill */}
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl flex items-center gap-3 shrink-0 shadow-xs">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[11px] text-slate-300 block font-medium">Your Current Rank</span>
            <div className="text-sm font-bold tabular-nums">
              Rank #{currentUser.rank} · {currentUser.points} XP
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedTrack === t.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, college, track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Student & College</th>
                <th className="py-3.5 px-4">Area of Interest</th>
                <th className="py-3.5 px-4 tabular-nums">CGPA</th>
                <th className="py-3.5 px-4 tabular-nums text-right">Points / XP</th>
                <th className="py-3.5 px-4 text-center">Milestones</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const isCurrent = student.id === currentUser.id;
                const displayRank = idx + 1;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-amber-50/60 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(displayRank)}
                      </div>
                    </td>

                    {/* Student Name & College */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{student.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-sm font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{student.college}</span>
                        </div>
                      </div>
                    </td>

                    {/* Area of Interest */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800">{student.areaOfInterest}</span>
                    </td>

                    {/* CGPA */}
                    <td className="py-4 px-4 tabular-nums font-semibold text-slate-800">
                      {student.cgpa.toFixed(2)}
                      <span className="text-slate-400 text-[10px] ml-0.5 font-normal">/10</span>
                    </td>

                    {/* Points / XP */}
                    <td className="py-4 px-4 text-right tabular-nums font-extrabold text-slate-900 text-sm">
                      {student.points} XP
                    </td>

                    {/* Milestones */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-[11px] text-slate-600">
                        {student.completedCourseCount} Courses · {student.completedTaskCount} Tasks
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      {!isCurrent ? (
                        <button
                          onClick={() => onSelectPeerForMessage(student.id)}
                          className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          <span>Message</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Self</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
