import React, { useState } from 'react';
import { Course, UserProfile } from '../types/index.ts';
import { CertificateModal } from './CertificateModal.tsx';
import {
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  currentUser: UserProfile;
  onCompleteCourse: (courseId: string) => Promise<void>;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  currentUser,
  onCompleteCourse,
}) => {
  const [selectedCourseForCert, setSelectedCourseForCert] = useState<Course | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const imageMap: Record<string, string> = {
    'course_frontend_mastery_1793426261105.jpg': '/src/assets/images/course_frontend_mastery_1793426261105.jpg',
    'course_backend_systems_1793426261424.jpg': '/src/assets/images/course_backend_systems_1793426261424.jpg',
    'course_ai_engineering_1793426262278.jpg': '/src/assets/images/course_ai_engineering_1793426262278.jpg',
  };

  const handleToggleExpand = (courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  const handleCompleteCourse = async (courseId: string) => {
    setLoadingCourseId(courseId);
    await onCompleteCourse(courseId);
    setLoadingCourseId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Professional Specializations
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Courses & Accredited Certifications
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mt-1">
          Complete industry-standard course tracks designed around hands-on engineering challenges. Earn verified credentials featuring verifiable IDs and instructor signatures for your resume and LinkedIn.
        </p>
      </div>

      {/* Courses List */}
      <div className="space-y-8">
        {courses.map((course) => {
          const isCompleted = currentUser.completedCourseIds.includes(course.id);
          const isExpanded = expandedCourseId === course.id;
          const imageSrc = imageMap[course.imageKey] || '/src/assets/images/course_frontend_mastery_1793426261105.jpg';

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Main Course Header Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Course Visual */}
                <div className="lg:col-span-4 relative min-h-[200px] lg:min-h-full bg-slate-950">
                  <img
                    src={imageSrc}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20">
                      {course.code}
                    </span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {course.track}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {course.skillsGained.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium">Lead Instructor:</span>
                      <strong className="text-slate-900">{course.instructor}</strong>
                      <span className="text-slate-400">({course.instructorRole})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleExpand(course.id)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus (4 Modules)'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isCompleted ? (
                        <button
                          onClick={() => setSelectedCourseForCert(course)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2"
                        >
                          <FileCheck2 className="w-4 h-4" />
                          <span>View Certificate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCompleteCourse(course.id)}
                          disabled={loadingCourseId === course.id}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{loadingCourseId === course.id ? 'Verifying...' : 'Complete & Unlock Certificate'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Syllabus Modules */}
              {isExpanded && (
                <div className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-200 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Course Curriculum & Laboratory Challenges
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">4 Core Engineering Modules</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {idx + 1}. {mod.title}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">{mod.duration}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{mod.summary}</p>

                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Key Theoretical Primitives:
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                            {mod.keyConcepts.map((kc) => (
                              <li key={kc}>{kc}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-2.5 bg-indigo-50/50 rounded-lg text-[11px] text-indigo-900 border border-indigo-100">
                          <strong>Practical Challenge:</strong> {mod.practicalChallenge}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isCompleted && (
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => handleCompleteCourse(course.id)}
                        disabled={loadingCourseId === course.id}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Finish All Modules & Claim Certificate (+300 XP)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {selectedCourseForCert && (
        <CertificateModal
          course={selectedCourseForCert}
          student={currentUser}
          onClose={() => setSelectedCourseForCert(null)}
        />
      )}
    </div>
  );
};
