import React, { useState, useEffect } from 'react';
import { Assessment, Question } from '../types/index.ts';
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface AssessmentArenaProps {
  assessments: Assessment[];
  onSubmitAssessment: (
    assessmentId: string,
    answers: Record<string, number>
  ) => Promise<{
    score: number;
    maxScore: number;
    percentage: number;
    earnedPoints: number;
    newRank: number;
    questionResults: {
      questionId: string;
      questionText: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  }>;
  onNavigate: (tab: string) => void;
}

export const AssessmentArena: React.FC<AssessmentArenaProps> = ({
  assessments,
  onSubmitAssessment,
  onNavigate,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    earnedPoints: number;
    newRank: number;
    questionResults: {
      questionId: string;
      questionText: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  } | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!selectedAssessment || resultData) return;
    if (timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedAssessment, resultData, timeLeftSeconds]);

  const handleStartTest = (asmt: Assessment) => {
    setSelectedAssessment(asmt);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResultData(null);
    setTimeLeftSeconds(asmt.durationMinutes * 60);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = async () => {
    if (!selectedAssessment || submitting) return;
    setSubmitting(true);
    try {
      const res = await onSubmitAssessment(selectedAssessment.id, selectedAnswers);
      setResultData(res);
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If viewing test results
  if (resultData && selectedAssessment) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-amber-400" />
          </div>

          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Assessment Completed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {selectedAssessment.title}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto mt-6">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block font-medium">Final Score</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {resultData.score} / {resultData.maxScore}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block font-medium">Accuracy</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{resultData.percentage}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block font-medium">XP Earned</span>
              <span className="text-xl font-bold text-emerald-600 tabular-nums">+{resultData.earnedPoints} XP</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block font-medium">Updated Rank</span>
              <span className="text-xl font-bold text-indigo-600 tabular-nums">#{resultData.newRank}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedAssessment(null);
                setResultData(null);
              }}
              className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Assessments</span>
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-5 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Question-by-Question Diagnostic Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand the architectural reasoning behind each concept.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {resultData.questionResults.map((qr, idx) => (
              <div
                key={qr.questionId}
                className={`p-5 rounded-xl border ${
                  qr.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        qr.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{qr.questionText}</h4>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-slate-600">
                          <strong>Your Answer:</strong>{' '}
                          <span className={qr.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                            {qr.selectedOption}
                          </span>
                        </div>
                        {!qr.isCorrect && (
                          <div className="text-slate-600">
                            <strong>Correct Answer:</strong>{' '}
                            <span className="text-emerald-700 font-medium">{qr.correctOption}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {qr.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Concept Explanation:</span>
                    {qr.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If actively taking a test
  if (selectedAssessment) {
    const qList = selectedAssessment.questions;
    const currentQ: Question | undefined = qList[currentQuestionIndex];
    const totalQ = qList.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Test Header with Timer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedAssessment.subjectTitle}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{selectedAssessment.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-900 font-mono text-sm font-semibold tabular-nums">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>

        {/* Question Card */}
        {currentQ ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-500">
                Question {currentQuestionIndex + 1} of {totalQ}
              </span>
              <span className="text-slate-400 font-medium">
                {answeredCount} of {totalQ} Answered
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {qList.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-slate-900 text-white'
                        : selectedAnswers[q.id] !== undefined
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                >
                  Finish & Submit
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white rounded-xl text-center text-slate-500">
            No questions available in this assessment yet.
          </div>
        )}
      </div>
    );
  }

  // Catalog of Assessments
  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Standardized Skill Benchmarks
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Skill Assessments & Rankings
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Take domain-specific timed assessments created by industry architects and engineering leads. Your scores directly impact your platform percentile, XP points, and verified leaderboard rank.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((asmt) => {
          const qCount = asmt.questions.length;
          return (
            <div
              key={asmt.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">{asmt.subjectTitle}</span>
                  <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {asmt.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{asmt.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{asmt.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{asmt.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{qCount} Questions</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Max: {asmt.totalMarks} Marks</span>
                <button
                  onClick={() => handleStartTest(asmt)}
                  disabled={qCount === 0}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
