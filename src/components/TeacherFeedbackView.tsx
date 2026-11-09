import React, { useState, useEffect } from 'react';
import {
  TeacherFeedback,
  UserProfile,
  TeacherProfile,
  StudentProblemInquiry,
} from '../types/index.ts';
import {
  GraduationCap,
  Award,
  Sparkles,
  BookOpen,
  Send,
  PlusCircle,
  FileCode,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Star,
  Users,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  X,
  Code2,
  Share2,
} from 'lucide-react';

interface TeacherFeedbackViewProps {
  feedbacks: TeacherFeedback[];
  currentUser: UserProfile | null;
  cohortStudents: any[];
  onSubmitFeedback: (feedbackData: any) => Promise<void>;
  onNavigateToChat: (teacherOrStudentId: string) => void;
  onOpenLogin: (role?: 'student' | 'teacher' | 'admin') => void;
}

export const TeacherFeedbackView: React.FC<TeacherFeedbackViewProps> = ({
  feedbacks,
  currentUser,
  cohortStudents,
  onSubmitFeedback,
  onNavigateToChat,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'solutions' | 'evaluations' | 'inquiries' | 'faculty'>('solutions');
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [inquiries, setInquiries] = useState<StudentProblemInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Modal States
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [shareSolutionModalOpen, setShareSolutionModalOpen] = useState(false);
  const [postFeedbackModalOpen, setPostFeedbackModalOpen] = useState(false);

  // Student Ask Problem Form
  const [askTeacherId, setAskTeacherId] = useState('tch-1');
  const [askSubject, setAskSubject] = useState('Distributed Backend & Databases');
  const [askTitle, setAskTitle] = useState('');
  const [askDetails, setAskDetails] = useState('');
  const [askCode, setAskCode] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('');

  // Teacher Share Solution Form
  const [solTitle, setSolTitle] = useState('');
  const [solSubject, setSolSubject] = useState('Distributed Systems & Architecture');
  const [solDoubt, setSolDoubt] = useState('');
  const [solCode, setSolCode] = useState('');
  const [solExplanation, setSolExplanation] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resLink, setResLink] = useState('');
  const [resCategory, setResCategory] = useState('Backend Systems');
  const [resType, setResType] = useState<'PDF' | 'GitHub' | 'Notes' | 'CheatSheet'>('CheatSheet');
  const [submittingSol, setSubmittingSol] = useState(false);

  // Teacher Student Evaluation Form
  const [evalStudentId, setEvalStudentId] = useState('');
  const [evalSubject, setEvalSubject] = useState('Holistic Technical Performance');
  const [evalAcumen, setEvalAcumen] = useState(9);
  const [evalProblemSolving, setEvalProblemSolving] = useState(8);
  const [evalDiscipline, setEvalDiscipline] = useState(9);
  const [evalConsistency, setEvalConsistency] = useState(8);
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalImprovements, setEvalImprovements] = useState('');
  const [evalVerdict, setEvalVerdict] = useState('');
  const [evalPlan, setEvalPlan] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isTeacherOrAdmin =
    currentUser !== null &&
    (currentUser.role === 'teacher' ||
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'uutkarsh319@gmail.com');

  // Load teachers list
  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success && Array.isArray(data.teachers)) {
        setTeachers(data.teachers);
        if (data.teachers.length > 0 && !askTeacherId) {
          setAskTeacherId(data.teachers[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load teachers:', err);
    }
  };

  // Load problem inquiries
  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.warn('Failed to load inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadInquiries();
  }, [currentUser]);

  // Handle student asking a problem
  const handleAskProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin('student');
      return;
    }
    if (!askTitle.trim() || !askDetails.trim()) return;

    setSubmittingInquiry(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: askTeacherId,
          subject: askSubject,
          problemTitle: askTitle,
          problemDetails: askDetails,
          codeSnippet: askCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Problem submitted to faculty! Check your direct chat with ${data.inquiry?.teacherName || 'the teacher'}.`);
        setAskTitle('');
        setAskDetails('');
        setAskCode('');
        setAskModalOpen(false);
        loadInquiries();
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Handle teacher sharing a problem solution & resource
  const handleShareSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solTitle.trim() || !solExplanation.trim()) return;

    setSubmittingSol(true);
    try {
      await onSubmitFeedback({
        studentId: 'cohort',
        subject: solSubject,
        problemTitle: solTitle,
        problemDoubt: solDoubt || 'Standard engineering inquiry from students',
        solutionSnippet: solCode,
        solutionExplanation: solExplanation,
        attachedResource: resTitle.trim() && resLink.trim() ? {
          title: resTitle.trim(),
          linkUrl: resLink.trim(),
          fileType: resType,
          category: resCategory,
        } : undefined,
      });

      setToastMessage('Verified problem solution & study resource published successfully!');
      setSolTitle('');
      setSolDoubt('');
      setSolCode('');
      setSolExplanation('');
      setResTitle('');
      setResLink('');
      setShareSolutionModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSol(false);
    }
  };

  // Handle teacher posting diagnostic student evaluation
  const handlePostEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudentId) return;

    setSubmittingEval(true);
    try {
      await onSubmitFeedback({
        studentId: evalStudentId,
        subject: evalSubject,
        ratings: {
          technicalAcumen: evalAcumen,
          problemSolving: evalProblemSolving,
          projectDiscipline: evalDiscipline,
          consistency: evalConsistency,
        },
        keyStrengths: evalStrengths.split(',').map((s) => s.trim()).filter(Boolean),
        areasOfImprovement: evalImprovements.split(',').map((s) => s.trim()).filter(Boolean),
        mentorVerdict: evalVerdict || 'Demonstrating strong analytical aptitude and clean engineering standards.',
        actionablePlan: evalPlan || 'Complete scheduled course assignments and defend capstone architecture.',
      });

      setToastMessage('Student diagnostic evaluation recorded successfully!');
      setEvalStudentId('');
      setEvalStrengths('');
      setEvalImprovements('');
      setEvalVerdict('');
      setEvalPlan('');
      setPostFeedbackModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEval(false);
    }
  };

  // Filter solutions (items with problemTitle) and evaluations
  const problemSolutions = feedbacks.filter((fb) => Boolean(fb.problemTitle));
  const studentEvaluations = feedbacks.filter((fb) => Boolean(fb.ratings));

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Faculty Mentorship & Solutions Exchange</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Teacher Feedback, Solutions & Doubt Resolution
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Faculty professors share verified code solutions and recommended study resources. Students can submit questions directly to faculty mentors or start a direct message consultation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Ask Faculty button for all students */}
          <button
            onClick={() => {
              if (!currentUser) onOpenLogin('student');
              else setAskModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask Teacher a Problem</span>
          </button>

          {/* Teacher Actions */}
          {isTeacherOrAdmin && (
            <>
              <button
                onClick={() => setShareSolutionModalOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Share Problem Solution</span>
              </button>

              <button
                onClick={() => setPostFeedbackModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200"
              >
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Evaluate Student</span>
              </button>
            </>
          )}

          {!currentUser && (
            <button
              onClick={() => onOpenLogin('teacher')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Teacher Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'solutions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verified Problem Solutions ({problemSolutions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'evaluations'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Student Evaluations ({studentEvaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'inquiries'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Student Doubts & Questions ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'faculty'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          <span>Faculty Directory ({teachers.length})</span>
        </button>
      </div>

      {/* TAB 1: VERIFIED PROBLEM SOLUTIONS */}
      {activeTab === 'solutions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Verified Technical Solutions & Problem Breakdowns
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authored by faculty professors with complete code snippets, theoretical explanations, and linked study resources.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {problemSolutions.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {sol.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">Published {sol.date}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 pt-1">
                      {sol.problemTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">{sol.teacherName}</span>
                      <span className="text-[10px] text-slate-500 block">{sol.teacherRole}</span>
                    </div>
                    {(() => {
                      const authorTeacher = teachers.find((t) => t.name.toLowerCase() === sol.teacherName.toLowerCase());
                      return (
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-slate-200">
                          {authorTeacher?.photoURL ? (
                            <img src={authorTeacher.photoURL} alt={sol.teacherName} className="w-full h-full object-cover" />
                          ) : (
                            sol.teacherName.charAt(0)
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Problem Statement / Doubt */}
                {sol.problemDoubt && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Student Problem / Technical Doubt Addressed:
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {sol.problemDoubt}
                    </p>
                  </div>
                )}

                {/* Solution Code Snippet */}
                {sol.solutionSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <span>Verified Implementation Snippet</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Clean Architecture</span>
                    </div>
                    <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{sol.solutionSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Explanation */}
                {sol.solutionExplanation && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-900 block">Technical Analysis & Explanation:</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                      {sol.solutionExplanation}
                    </p>
                  </div>
                )}

                {/* Attached Study Resource & Discussion Trigger */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  {sol.attachedResource ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Recommended Resource:</span>
                      <a
                        href={sol.attachedResource.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{sol.attachedResource.title}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => {
                      const matchedTeacher = teachers.find((t) => t.name === sol.teacherName);
                      onNavigateToChat(matchedTeacher ? matchedTeacher.id : 'tch-1');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss Problem with {sol.teacherName}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Faculty Assessments & Diagnostic Feedback
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured evaluations assessing technical acumen, problem solving discipline, and personalized improvement roadmaps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentEvaluations.map((evalItem) => (
              <div
                key={evalItem.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {evalItem.subject}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Evaluation for {evalItem.studentName || 'Student'}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Evaluated by {evalItem.teacherName} ({evalItem.teacherRole}) on {evalItem.date}
                    </span>
                  </div>
                </div>

                {/* 4 Ratings Grid */}
                {evalItem.ratings && (
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-500 font-semibold block">Technical Acumen</span>
                      <strong className="text-sm text-slate-900 block tabular-nums">{evalItem.ratings.technicalAcumen} / 10</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-500 font-semibold block">Problem Solving</span>
                      <strong className="text-sm text-slate-900 block tabular-nums">{evalItem.ratings.problemSolving} / 10</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-500 font-semibold block">Code Discipline</span>
                      <strong className="text-sm text-slate-900 block tabular-nums">{evalItem.ratings.projectDiscipline} / 10</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] text-slate-500 font-semibold block">Consistency</span>
                      <strong className="text-sm text-slate-900 block tabular-nums">{evalItem.ratings.consistency} / 10</strong>
                    </div>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="space-y-2 text-xs">
                  {evalItem.keyStrengths && evalItem.keyStrengths.length > 0 && (
                    <div>
                      <span className="font-bold text-emerald-800 block mb-1">Key Strengths:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {evalItem.keyStrengths.map((str, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                            ✓ {str}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {evalItem.areasOfImprovement && evalItem.areasOfImprovement.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-amber-800 block mb-1">Areas for Growth:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {evalItem.areasOfImprovement.map((imp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200">
                            → {imp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verdict & Plan */}
                {evalItem.mentorVerdict && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Mentor Verdict</span>
                    <p className="text-slate-800 font-medium mt-0.5">{evalItem.mentorVerdict}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT DOUBTS & QUESTIONS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Student Technical Doubts & Inquiries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical questions submitted by students directly to verified faculty mentors for review and solution sharing.
              </p>
            </div>

            <button
              onClick={() => {
                if (!currentUser) onOpenLogin('student');
                else setAskModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ask New Problem</span>
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No Student Doubts Pending</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Have a question about algorithms, microservices, or web performance? Submit your doubt to get verified guidance from professors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inq.subject}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{inq.problemTitle}</h4>
                      <p className="text-[11px] text-slate-500">
                        Asked by <span className="font-semibold text-slate-800">{inq.studentName}</span> to <span className="font-semibold text-indigo-700">{inq.teacherName}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateToChat(inq.teacherId)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with Faculty</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {inq.problemDetails}
                  </p>

                  {inq.codeSnippet && (
                    <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{inq.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FACULTY DIRECTORY & OFFICE HOURS */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Certified Faculty Mentors & Academic Advisors
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect directly with experienced professors across Distributed Systems, Advanced Frontend, and Applied AI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachers.map((tch) => (
              <div
                key={tch.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm overflow-hidden ring-1 ring-slate-200">
                      {tch.photoURL ? (
                        <img src={tch.photoURL} alt={tch.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{tch.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{tch.name}</h4>
                      <p className="text-[11px] text-slate-500">{tch.department}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-150">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Specialization:</span>
                      <strong className="text-slate-900 text-xs block">{tch.specialization}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{tch.officeHours}</span>
                      </span>
                      <span className="font-semibold text-emerald-700">★ {tch.rating} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setAskTeacherId(tch.id);
                      setAskModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Ask Problem
                  </button>
                  <button
                    onClick={() => onNavigateToChat(tch.id)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT ASK PROBLEM */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 text-xs space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ask Problem to Faculty Mentor</h3>
                  <p className="text-[11px] text-slate-500">Direct technical inquiry & solution request</p>
                </div>
              </div>
              <button
                onClick={() => setAskModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAskProblemSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Faculty Mentor</label>
                  <select
                    value={askTeacherId}
                    onChange={(e) => setAskTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization.split('&')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Topic</label>
                  <input
                    type="text"
                    required
                    value={askSubject}
                    onChange={(e) => setAskSubject(e.target.value)}
                    placeholder="e.g. Distributed Caching, React 19"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preventing cache stampede when keys expire concurrently in Redis"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Details & Where You are Stuck</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your doubt, constraints, and what approach you tried..."
                  value={askDetails}
                  onChange={(e) => setAskDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="// Paste your relevant function or error code here..."
                  value={askCode}
                  onChange={(e) => setAskCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingInquiry ? 'Sending Doubt...' : 'Submit Problem to Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEACHER SHARE SOLUTION & RESOURCE */}
      {shareSolutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 text-xs space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Share Problem Solution & Study Resource</h3>
                  <p className="text-[11px] text-slate-500">Publish verified solution for student doubts and attach study material</p>
                </div>
              </div>
              <button
                onClick={() => setShareSolutionModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareSolutionSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Area</label>
                  <input
                    type="text"
                    required
                    value={solSubject}
                    onChange={(e) => setSolSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Solution Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Mutex & Redis SET NX Pattern"
                    value={solTitle}
                    onChange={(e) => setSolTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem / Student Doubt Addressed</label>
                <input
                  type="text"
                  placeholder="e.g. How to prevent high-traffic cache stampedes without freezing worker threads"
                  value={solDoubt}
                  onChange={(e) => setSolDoubt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Code Solution</label>
                <textarea
                  rows={4}
                  placeholder="// Paste verified solution code implementation here..."
                  value={solCode}
                  onChange={(e) => setSolCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Explanation & Key Principles</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this approach works, complexity tradeoffs, and best practices..."
                  value={solExplanation}
                  onChange={(e) => setSolExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Attach Shared Resource */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Optional: Attach Recommended Study Resource
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Resource Title (e.g. Caching Blueprint PDF)"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="url"
                    placeholder="Link URL (https://...)"
                    value={resLink}
                    onChange={(e) => setResLink(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CheatSheet">CheatSheet</option>
                    <option value="GitHub">GitHub Repo</option>
                    <option value="PDF">PDF Guide</option>
                    <option value="Notes">Notes</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Category (e.g. Distributed Systems)"
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShareSolutionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSol}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingSol ? 'Publishing...' : 'Publish Verified Solution & Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER POST STUDENT EVALUATION */}
      {postFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 text-xs space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Evaluate Student Performance</h3>
                  <p className="text-[11px] text-slate-500">Provide official feedback and diagnostic ratings</p>
                </div>
              </div>
              <button
                onClick={() => setPostFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostEvaluationSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Registered Student</label>
                <select
                  required
                  value={evalStudentId}
                  onChange={(e) => setEvalStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">-- Choose Registered Student --</option>
                  {cohortStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.areaOfInterest || 'Engineering Student'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  required
                  value={evalSubject}
                  onChange={(e) => setEvalSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* 4 Ratings */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Technical Acumen ({evalAcumen}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalAcumen}
                    onChange={(e) => setEvalAcumen(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Problem Solving ({evalProblemSolving}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalProblemSolving}
                    onChange={(e) => setEvalProblemSolving(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Code Discipline ({evalDiscipline}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalDiscipline}
                    onChange={(e) => setEvalDiscipline(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Consistency ({evalConsistency}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalConsistency}
                    onChange={(e) => setEvalConsistency(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Strengths (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean architecture, Quick problem solving"
                    value={evalStrengths}
                    onChange={(e) => setEvalStrengths(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Areas for Growth (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed lock testing, Edge cases"
                    value={evalImprovements}
                    onChange={(e) => setEvalImprovements(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Verdict & Recommendation</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summarize the candidate's technical readiness and placement prospects..."
                  value={evalVerdict}
                  onChange={(e) => setEvalVerdict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actionable Preparation Plan</label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, tasks, or milestones student should complete next..."
                  value={evalPlan}
                  onChange={(e) => setEvalPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPostFeedbackModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingEval ? 'Submitting...' : 'Record Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
