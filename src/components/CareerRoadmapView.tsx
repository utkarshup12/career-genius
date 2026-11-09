import React, { useState } from 'react';
import { UserProfile, Course, CareerTask } from '../types/index.ts';
import {
  getTrackRoadmap,
  calculateRoadmapProgress,
  RoadmapMilestone,
} from '../utils/careerLogic.ts';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  ListTodo,
  Sparkles,
  Lock,
  ChevronRight,
  Layers,
  GraduationCap,
  Target,
  ExternalLink,
} from 'lucide-react';

interface CareerRoadmapViewProps {
  currentUser: UserProfile | null;
  courses: Course[];
  tasks: CareerTask[];
  onNavigate: (tab: string) => void;
  onOpenAiMentor: () => void;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({
  currentUser,
  courses,
  tasks,
  onNavigate,
  onOpenAiMentor,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>(
    currentUser?.areaOfInterest || 'Software Developer'
  );
  const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);

  const availableTracks = [
    'Frontend Developer',
    'Backend Developer',
    'AI / ML Engineer',
    'Software Developer',
    'DevOps & Cloud',
  ];

  // Derive completed assessment subjects
  const completedAssessmentSubjectIds = currentUser
    ? currentUser.assessmentScores.map((s) => {
        if (s.subjectTitle.toLowerCase().includes('front')) return 'subj-fe';
        if (s.subjectTitle.toLowerCase().includes('back')) return 'subj-be';
        if (s.subjectTitle.toLowerCase().includes('algo') || s.subjectTitle.toLowerCase().includes('data'))
          return 'subj-dsa';
        if (s.subjectTitle.toLowerCase().includes('cloud') || s.subjectTitle.toLowerCase().includes('devops'))
          return 'subj-cloud';
        if (s.subjectTitle.toLowerCase().includes('ai') || s.subjectTitle.toLowerCase().includes('learn'))
          return 'subj-ai';
        return 'subj-general';
      })
    : [];

  const rawMilestones = getTrackRoadmap(selectedTrack);
  const progressData = calculateRoadmapProgress(
    rawMilestones,
    currentUser?.completedCourseIds || [],
    currentUser?.completedTaskIds || [],
    completedAssessmentSubjectIds
  );

  const activeMilestone = selectedMilestone || progressData.currentMilestone || rawMilestones[0];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'task':
        return <ListTodo className="w-4 h-4 text-sky-500" />;
      case 'feedback':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <Compass className="w-4 h-4" />
            <span>Curated Career Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Interactive Career Track Roadmap
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Step-by-step milestone progression towards placement readiness. Milestones unlock dynamically as you pass domain assessments, complete courses, and submit practical deliverables.
          </p>
        </div>

        <button
          onClick={onOpenAiMentor}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask AI to Customize Roadmap</span>
        </button>
      </div>

      {/* Track Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {availableTracks.map((trk) => {
            const isUserEnrolled =
              currentUser !== null &&
              currentUser.areaOfInterest.toLowerCase() === trk.toLowerCase();
            const isSelected = selectedTrack.toLowerCase() === trk.toLowerCase();

            return (
              <button
                key={trk}
                onClick={() => {
                  setSelectedTrack(trk);
                  setSelectedMilestone(null);
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{trk}</span>
                {isUserEnrolled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" title="Enrolled Track" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Target Role: <strong className="text-slate-900">{selectedTrack}</strong>
        </div>
      </div>

      {/* Overall Track Progress Hero Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              <span>Track Progress Overview</span>
              <span aria-hidden="true">·</span>
              <span>{selectedTrack}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold leading-snug">
              {progressData.completedCount} of {progressData.totalCount} Milestones Reached ({progressData.percentage}%)
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {progressData.percentage >= 80
                ? 'You have completed nearly the entire specialization! Ready for mock technical interviews and final capstone defense.'
                : progressData.percentage >= 40
                ? 'Strong foundational momentum. Focus on applied project deliverables and capstone challenges to achieve Job Ready certification.'
                : 'Getting started on this career track. Begin with the foundational domain assessment to benchmark your skills.'}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700 max-w-xl">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressData.percentage}%` }}
              />
            </div>
          </div>

          <div className="lg:col-span-4 p-5 bg-slate-800 rounded-xl border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                Next Immediate Objective
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {progressData.currentMilestone?.title || 'Track Completed'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {progressData.currentMilestone?.deliverableName}
              </p>
            </div>

            {progressData.currentMilestone && (
              <button
                onClick={() => onNavigate(progressData.currentMilestone!.actionTarget)}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Resume Active Milestone</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Milestone Interface: Interactive Stepper & Active Milestone Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Step-by-Step Vertical Milestone List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Step-by-Step Progression Stages
            </h4>
            <span className="text-xs text-slate-500 font-medium">Click any milestone for details</span>
          </div>

          <div className="space-y-3">
            {progressData.milestones.map((m) => {
              const isSelected = activeMilestone?.id === m.id;
              const isCompleted = m.status === 'completed';
              const isInProgress = m.status === 'in_progress';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                      : isCompleted
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : isInProgress
                      ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Step Status Badge */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-indigo-100">
                        {m.stepNumber}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-semibold">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Milestone Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Step {m.stepNumber} · {m.stage}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Achieved
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                            Active Milestone
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>~{m.estimatedWeeks} Weeks</span>
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {m.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {m.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1">
                      {m.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Active Milestone Deck */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          {activeMilestone && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Milestone Specification</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Step {activeMilestone.stepNumber} of {rawMilestones.length}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {activeMilestone.stage}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {activeMilestone.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {activeMilestone.description}
                </p>
              </div>

              {/* Required Deliverable */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  {getActionIcon(activeMilestone.actionType)}
                  <span>Prerequisite Deliverable</span>
                </div>
                <p className="text-xs font-medium text-slate-900">
                  {activeMilestone.deliverableName}
                </p>
                <div className="text-[11px] text-slate-500">
                  Estimated Completion Window: <strong>{activeMilestone.estimatedWeeks} Weeks</strong>
                </div>
              </div>

              {/* Skills Validated */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Technical Competencies Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMilestone.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Action Navigation Button */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onNavigate(activeMilestone.actionTarget)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>
                    {activeMilestone.actionType === 'course'
                      ? 'Go to Required Course'
                      : activeMilestone.actionType === 'task'
                      ? 'Open Deliverable in Tasks'
                      : 'Take Assessment Now'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Completing this step will automatically update your verified roadmap progress.
                </p>
              </div>
            </div>
          )}

          {/* AI Guidance Callout */}
          <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Need Mentorship on this Milestone?</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              Ask Career Genius AI to break this milestone into daily coding routines or recommend open-source sample code.
            </p>
            <button
              onClick={onOpenAiMentor}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              <span>Get AI Milestone Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
