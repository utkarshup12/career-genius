import React, { useState } from 'react';
import { TeacherFeedback, UserProfile } from '../types/index.ts';
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Send,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface TeacherFeedbackViewProps {
  feedbacks: TeacherFeedback[];
  currentUser: UserProfile;
  allCohortStudents?: { id: string; name: string; cgpa: number; areaOfInterest: string }[];
  onSubmitTeacherFeedback: (feedback: {
    studentId: string;
    subject: string;
    ratings: {
      technicalAcumen: number;
      problemSolving: number;
      projectDiscipline: number;
      consistency: number;
    };
    keyStrengths: string[];
    areasOfImprovement: string[];
    mentorVerdict: string;
    actionablePlan: string;
  }) => Promise<void>;
}

export const TeacherFeedbackView: React.FC<TeacherFeedbackViewProps> = ({
  feedbacks,
  currentUser,
  allCohortStudents = [],
  onSubmitTeacherFeedback,
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Teacher feedback form state
  const [targetStudentId, setTargetStudentId] = useState(allCohortStudents[0]?.id || 'usr-student-aarav');
  const [subject, setSubject] = useState('Frontend Architecture & Systems Assessment');
  const [technicalAcumen, setTechnicalAcumen] = useState(9);
  const [problemSolving, setProblemSolving] = useState(8);
  const [projectDiscipline, setProjectDiscipline] = useState(9);
  const [consistency, setConsistency] = useState(9);
  const [strengthsText, setStrengthsText] = useState('Strong understanding of React rendering and state transitions\nExcellent code hygiene in laboratory tasks');
  const [improvementsText, setImprovementsText] = useState('Expand knowledge on distributed microservices and caching\nParticipate more actively in architectural debates');
  const [mentorVerdict, setMentorVerdict] = useState('Outstanding commitment to technical excellence and prompt completion of milestones.');
  const [actionablePlan, setActionablePlan] = useState('Complete the Distributed Backend assessment by end of week and deliver the Capstone presentation.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitTeacherFeedback({
        studentId: targetStudentId,
        subject,
        ratings: {
          technicalAcumen: Number(technicalAcumen),
          problemSolving: Number(problemSolving),
          projectDiscipline: Number(projectDiscipline),
          consistency: Number(consistency),
        },
        keyStrengths: strengthsText.split('\n').filter((s) => s.trim().length > 0),
        areasOfImprovement: improvementsText.split('\n').filter((s) => s.trim().length > 0),
        mentorVerdict,
        actionablePlan,
      });
      setShowSubmitModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Academic & Industry Mentorship
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Personalized Teacher Feedback
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Official evaluation reports and constructive feedback provided by university professors and verified faculty mentors.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shrink-0 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Student Evaluation</span>
          </button>
        )}
      </div>

      {/* Feedbacks Grid */}
      <div className="space-y-6">
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Feedback Reports Logged Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your professors and mentors will evaluate your technical assessments and issue personalized feedback here.
            </p>
          </div>
        ) : (
          feedbacks.map((fb) => {
            const avgRating = (
              (fb.ratings.technicalAcumen +
                fb.ratings.problemSolving +
                fb.ratings.projectDiscipline +
                fb.ratings.consistency) /
              4
            ).toFixed(1);

            return (
              <div
                key={fb.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{fb.teacherName}</h3>
                        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {fb.teacherRole}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Review for: <strong className="text-slate-800">{fb.studentName}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Evaluation Date: {fb.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Overall Mentor Score</span>
                      <span className="text-lg font-bold text-slate-900 tabular-nums">{avgRating} / 10.0</span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                      <Star className="w-5 h-5 fill-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Subject & Core Ratings Bar Grid */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-700">
                    Subject / Evaluation Scope: <span className="font-bold text-slate-900">{fb.subject}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Technical Acumen</span>
                        <span className="font-bold text-slate-900 tabular-nums">{fb.ratings.technicalAcumen}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${(fb.ratings.technicalAcumen / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Problem Solving</span>
                        <span className="font-bold text-slate-900 tabular-nums">{fb.ratings.problemSolving}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-600 h-full rounded-full"
                          style={{ width: `${(fb.ratings.problemSolving / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Project Discipline</span>
                        <span className="font-bold text-slate-900 tabular-nums">{fb.ratings.projectDiscipline}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${(fb.ratings.projectDiscipline / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Consistency</span>
                        <span className="font-bold text-slate-900 tabular-nums">{fb.ratings.consistency}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full"
                          style={{ width: `${(fb.ratings.consistency / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvement 2-Column Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Observed Strengths</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {fb.keyStrengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Areas for Growth & Focus</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {fb.areasOfImprovement.map((imp, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">→</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mentor Verdict & Action Plan */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Mentor Verdict:</span>
                    <p className="text-slate-700 leading-relaxed">{fb.mentorVerdict}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-indigo-900 block mb-0.5">30-Day Actionable Guidance:</span>
                    <p className="text-indigo-950 font-medium leading-relaxed">{fb.actionablePlan}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Teacher Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Issue Official Faculty Evaluation</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {allCohortStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (CGPA: {s.cgpa} · {s.areaOfInterest})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evaluation Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Rating Sliders */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">Technical Acumen</span>
                    <span className="font-bold text-slate-900 tabular-nums">{technicalAcumen}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={technicalAcumen}
                    onChange={(e) => setTechnicalAcumen(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">Problem Solving</span>
                    <span className="font-bold text-slate-900 tabular-nums">{problemSolving}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">Project Discipline</span>
                    <span className="font-bold text-slate-900 tabular-nums">{projectDiscipline}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={projectDiscipline}
                    onChange={(e) => setProjectDiscipline(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">Consistency</span>
                    <span className="font-bold text-slate-900 tabular-nums">{consistency}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={consistency}
                    onChange={(e) => setConsistency(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Strengths (one per line)
                </label>
                <textarea
                  rows={2}
                  required
                  value={strengthsText}
                  onChange={(e) => setStrengthsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Areas of Improvement (one per line)
                </label>
                <textarea
                  rows={2}
                  required
                  value={improvementsText}
                  onChange={(e) => setImprovementsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mentor Verdict</label>
                <textarea
                  rows={2}
                  required
                  value={mentorVerdict}
                  onChange={(e) => setMentorVerdict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">30-Day Actionable Plan</label>
                <textarea
                  rows={2}
                  required
                  value={actionablePlan}
                  onChange={(e) => setActionablePlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Record Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
