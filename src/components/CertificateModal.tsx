import React from 'react';
import { Course, UserProfile } from '../types/index.ts';
import { generateCredentialId } from '../utils/careerLogic.ts';
import { Award, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  student: UserProfile;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  student,
  onClose,
}) => {
  const credentialId = generateCredentialId(course.code, student.id);
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Accredited Platform Credential</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              aria-label="Close certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Document Canvas */}
        <div className="mt-4 p-8 sm:p-12 border-4 border-double border-slate-300 rounded-xl bg-gradient-to-b from-white via-slate-50/30 to-white text-center relative overflow-hidden">
          {/* Subtle watermark background seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header / Seal */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-2">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                Career Genius Academic Benchmark
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase mt-1">
                Certificate of Technical Mastery
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-slate-600 italic">
              This officially certifies that
            </p>

            {/* Recipient */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 underline decoration-slate-300 underline-offset-8">
                {student.name}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-2">
                CGPA: {student.cgpa.toFixed(2)} · {student.college}
              </p>
            </div>

            {/* Accomplishment description */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
              has successfully completed all laboratory modules, code review milestones, and architectural assessments in
            </p>

            {/* Course Title */}
            <div className="bg-slate-100/80 py-3 px-6 rounded-xl inline-block max-w-lg mx-auto border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {course.title}
              </h3>
              <span className="text-xs text-indigo-700 font-semibold block mt-0.5">
                Specialization Track: {course.track}
              </span>
            </div>

            {/* Signatures & Seal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200 mt-8 items-end text-xs">
              <div className="text-center sm:text-left">
                <div className="font-serif italic text-base text-slate-800 font-semibold mb-1">
                  {course.instructor}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold text-slate-900 block">{course.instructor}</span>
                  <span className="text-[10px] text-slate-500">{course.instructorRole}</span>
                </div>
              </div>

              {/* Official Verified Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center shadow-xs mb-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                  Verified Credential
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Status: Authenticated</span>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-medium text-slate-800 mb-1">{issueDate}</div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold text-slate-900 block">Date of Issuance</span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    ID: {credentialId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
