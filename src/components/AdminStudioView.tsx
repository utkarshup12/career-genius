import React, { useState } from 'react';
import { Subject, Question, UserProfile } from '../types/index.ts';
import {
  Shield,
  PlusCircle,
  BookOpen,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  ListOrdered,
  Users,
} from 'lucide-react';

interface AdminStudioViewProps {
  subjects: Subject[];
  assessments: { id: string; subjectId: string; title: string; questions: Question[] }[];
  currentUser: UserProfile;
  onAddQuestion: (question: {
    subjectId: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }) => Promise<void>;
  onAddSubject: (subject: {
    title: string;
    description: string;
    iconName?: string;
  }) => Promise<void>;
}

export const AdminStudioView: React.FC<AdminStudioViewProps> = ({
  subjects,
  assessments,
  currentUser,
  onAddQuestion,
  onAddSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'subjects' | 'analytics'>('questions');

  // Add question state
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || 'subj-fe');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [submittingQ, setSubmittingQ] = useState(false);
  const [qSuccessMessage, setQSuccessMessage] = useState('');

  // Add subject state
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [submittingS, setSubmittingS] = useState(false);
  const [sSuccessMessage, setSSuccessMessage] = useState('');

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) return;
    setSubmittingQ(true);
    setQSuccessMessage('');

    try {
      const options = [optionA, optionB, optionC || 'Option C', optionD || 'Option D'];
      await onAddQuestion({
        subjectId: targetSubjectId,
        question: questionText,
        options,
        correctIndex: Number(correctIndex),
        explanation: explanation || 'Standard verified domain concept.',
        difficulty,
      });

      setQSuccessMessage('Question added successfully to the live assessment bank!');
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setExplanation('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle.trim()) return;
    setSubmittingS(true);
    setSSuccessMessage('');

    try {
      await onAddSubject({
        title: subjectTitle,
        description: subjectDescription,
      });
      setSSuccessMessage(`Subject "${subjectTitle}" created and linked to assessments!`);
      setSubjectTitle('');
      setSubjectDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingS(false);
    }
  };

  // Compute question stats
  const totalQuestions = assessments.reduce((sum, a) => sum + a.questions.length, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Curriculum, Assessment & Subject Manager
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Add new assessment questions with options and explanations, create new technical subjects, and monitor platform benchmarks.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Questions
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'subjects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Subject
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank & Analytics
          </button>
        </div>
      </div>

      {/* TAB 1: Add Questions */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Question to Assessment Bank</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input verified multiple-choice questions with answer choices and technical explanations.
                </p>
              </div>
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>

            {qSuccessMessage && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{qSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4 mt-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Subject Track</label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. In relational database indexing, how does a B-Tree structure minimize disk I/O operations?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-3 pt-2">
                <label className="block font-semibold text-slate-700">Four Multiple Choice Options</label>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      A
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option A"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      B
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option B"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      C
                    </span>
                    <input
                      type="text"
                      placeholder="Option C"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      D
                    </span>
                    <input
                      type="text"
                      placeholder="Option D"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correct Answer Index</label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Concept Explanation
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this option is correct for the student diagnostic feedback review..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingQ}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {submittingQ ? 'Adding Question...' : 'Add Question to Assessment Bank'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xs space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Assessment System Architecture
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you add a question, it is immediately attached to that subject&apos;s active test. Each question carries 10 total marks and provides algorithmic feedback upon student submission.
              </p>
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Total Live Questions</span>
                <strong className="text-white tabular-nums">{totalQuestions} Questions</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Add Subject */}
      {activeTab === 'subjects' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Create New Domain Subject</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adding a subject automatically establishes a corresponding standardized assessment in the student arena.
            </p>
          </div>

          {sSuccessMessage && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubject} className="space-y-4 mt-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Consensus & Blockchain Systems"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
              <textarea
                rows={3}
                required
                placeholder="Describe key domain topics, concepts, and algorithms covered in this subject..."
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submittingS}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {submittingS ? 'Creating Subject...' : 'Create Subject & Assessment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Question Bank & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Total Subjects</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                {subjects.length} Subjects
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Question Bank Inventory</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                {totalQuestions} Active Questions
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Registered Student Cohort</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                1,280 Students
              </span>
            </div>
          </div>

          {/* Current Subjects & Question Counts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Current Subjects & Question Allocation</h3>
            <div className="divide-y divide-slate-100">
              {subjects.map((s) => {
                const asmt = assessments.find((a) => a.subjectId === s.id);
                const count = asmt?.questions.length || 0;
                return (
                  <div key={s.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{s.title}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">{s.description}</p>
                    </div>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums shrink-0">
                      {count} Questions ({count * 10} Marks)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
