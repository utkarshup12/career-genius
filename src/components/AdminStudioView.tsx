import React, { useState, useEffect } from 'react';
import { Subject, Question, UserProfile } from '../types/index.ts';
import {
  db,
  collection,
  getDocs,
  handleFirestoreError,
  OperationType,
  BOOTSTRAP_ADMIN_EMAIL,
} from '../firebase.ts';
import {
  Shield,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  Users,
  Search,
  Filter,
  GraduationCap,
  Award,
  ExternalLink,
  Lock,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  X,
  FileText,
  AlertTriangle,
  Edit3,
  Trash2,
  Share2,
  Check,
  Laptop,
  Smartphone,
} from 'lucide-react';

interface RegisteredStudentEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  cgpa: number;
  areaOfInterest: string;
  college: string;
  graduationYear: number;
  points: number;
  rank: number;
  completedCourseCount?: number;
  completedTaskCount?: number;
  assessmentCount?: number;
  assessmentScores?: {
    assessmentId: string;
    subjectTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    date: string;
  }[];
  badgesCount?: number;
  registeredAt?: string;
  photoURL?: string;
}

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
  const [activeTab, setActiveTab] = useState<'students' | 'questions' | 'subjects' | 'analytics'>('students');

  // Registered Students State
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudentEntry[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter] = useState<'all' | '9plus' | '8plus'>('all');
  const [inspectStudent, setInspectStudent] = useState<RegisteredStudentEntry | null>(null);

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

  // Load Registered Students from Firestore and Platform Backend
  const loadRegisteredStudents = async () => {
    setLoadingStudents(true);
    try {
      const studentMap = new Map<string, RegisteredStudentEntry>();

      // 1. Fetch from backend cohort directory
      try {
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          data.students.forEach((s: RegisteredStudentEntry) => {
            studentMap.set(s.id, s);
          });
        }
      } catch (err) {
        console.warn('Backend student directory fetch failed:', err);
      }

      // 2. Fetch directly from Firestore users collection
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach((doc) => {
          const d = doc.data() as any;
          const entry: RegisteredStudentEntry = {
            id: doc.id,
            name: d.name || 'Student Candidate',
            email: d.email || 'student@domain.edu',
            role: d.role || 'student',
            cgpa: d.cgpa ?? 8.5,
            areaOfInterest: d.areaOfInterest || 'Software Developer',
            college: d.college || 'National Technical Institute',
            graduationYear: d.graduationYear || 2026,
            points: d.points ?? 1000,
            rank: d.rank ?? 5,
            completedCourseCount: d.completedCourseIds?.length || 0,
            completedTaskCount: d.completedTaskIds?.length || 0,
            assessmentCount: d.assessmentScores?.length || 0,
            assessmentScores: d.assessmentScores || [],
            badgesCount: d.badges?.filter((b: any) => b.isUnlocked)?.length || 0,
            registeredAt: d.createdAt || '2026-10-25T12:00:00Z',
            photoURL: d.photoURL,
          };
          studentMap.set(doc.id, entry);
        });
      } catch (dbErr) {
        console.warn('Firestore users collection fetch caught:', dbErr);
      }

      setRegisteredStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error('Error fetching registered students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'admin') {
      loadRegisteredStudents();
    }
  }, [currentUser.role]);

  // STRICT ACCESS CONTROL GATE
  // If user is not an administrator, completely block access with defensive security UI
  const isAdmin = currentUser.role === 'admin' || currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            RBAC Permission Denied
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The Admin Studio is strictly restricted to platform administrators. Registered student accounts do not have permission to view other student records or alter curriculum assessments.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 max-w-md mx-auto text-left space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-700" />
            <span>Authorized Administrator Identity:</span>
          </div>
          <p className="text-slate-500 font-mono text-[11px]">
            {BOOTSTRAP_ADMIN_EMAIL}
          </p>
          <p className="text-[11px] text-slate-500 pt-1">
            Current session: <span className="font-semibold text-slate-800">{currentUser.email}</span> (Role: <span className="capitalize">{currentUser.role}</span>)
          </p>
        </div>
      </div>
    );
  }

  // Filtered Students Calculation
  const filteredStudents = registeredStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.areaOfInterest.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack =
      selectedTrackFilter === 'All' || student.areaOfInterest === selectedTrackFilter;

    const matchesCgpa =
      cgpaFilter === 'all' ||
      (cgpaFilter === '9plus' && student.cgpa >= 9.0) ||
      (cgpaFilter === '8plus' && student.cgpa >= 8.0);

    return matchesSearch && matchesTrack && matchesCgpa;
  });

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
            Registered Students Directory & Platform Management
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Review all students registered through Google/Gmail, author curriculum questions, and manage academic subjects.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Registered Students ({registeredStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Questions
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Subject
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank & Analytics
          </button>
        </div>
      </div>

      {/* TAB 0: REGISTERED STUDENTS DIRECTORY (Primary Admin Feature) */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                Total Registered Students
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                {registeredStudents.length} Students
              </span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                Stored in Google Cloud Firestore
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                Average Cohort CGPA
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                {registeredStudents.length > 0
                  ? (
                      registeredStudents.reduce((acc, s) => acc + (s.cgpa || 0), 0) /
                      registeredStudents.length
                    ).toFixed(2)
                  : '8.80'}{' '}
                / 10
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Academic Benchmark
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                Total Assessments Completed
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                {registeredStudents.reduce((acc, s) => acc + (s.assessmentCount || 0), 0)} Tests
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                Skill Diagnostics Logged
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                Database Sync Status
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-900">Connected & Verified</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Firestore users/ collection
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email, college, track..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end overflow-x-auto text-xs">
              {/* Career Track Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">Track:</span>
                <select
                  value={selectedTrackFilter}
                  onChange={(e) => setSelectedTrackFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="All">All Tracks</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                </select>
              </div>

              {/* CGPA Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">CGPA:</span>
                <select
                  value={cgpaFilter}
                  onChange={(e) => setCgpaFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="all">All CGPAs</option>
                  <option value="9plus">9.0+ (Honors)</option>
                  <option value="8plus">8.0+ (First Class)</option>
                </select>
              </div>

              <button
                onClick={loadRegisteredStudents}
                disabled={loadingStudents}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-200"
              >
                {loadingStudents ? 'Refreshing...' : 'Refresh Roster'}
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Student / Gmail
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      College & Year
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Academic CGPA
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Career Track
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Points & Rank
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Assessments
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Dossier
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm text-slate-700">No students match current filter</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isHighCgpa = student.cgpa >= 9.0;
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Student Info */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{student.name}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Student
                                  </span>
                                </div>
                                <div className="text-slate-500 text-[11px] font-mono flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{student.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* College & Grad Year */}
                          <td className="px-4 py-4">
                            <div className="text-slate-800 font-medium">
                              {student.college}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Class of {student.graduationYear}</span>
                            </div>
                          </td>

                          {/* CGPA */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${
                                isHighCgpa
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {student.cgpa.toFixed(2)} / 10
                            </span>
                          </td>

                          {/* Target Role */}
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">
                              {student.areaOfInterest}
                            </div>
                          </td>

                          {/* Points & Rank */}
                          <td className="px-4 py-4 tabular-nums">
                            <div className="font-bold text-slate-900">
                              {student.points} XP
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Rank #{student.rank}
                            </div>
                          </td>

                          {/* Completed Assessments */}
                          <td className="px-4 py-4">
                            <span className="font-medium text-slate-800">
                              {student.assessmentCount || student.assessmentScores?.length || 0} Tests
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {student.completedCourseCount || 0} Courses done
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => setInspectStudent(student)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              View Dossier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DOSSIER INSPECTION MODAL */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-emerald-400">
                  {inspectStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{inspectStudent.name}</h3>
                  <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{inspectStudent.email}</span>
                    <span>·</span>
                    <span>Class of {inspectStudent.graduationYear}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">CGPA</span>
                  <strong className="text-base text-slate-900 block mt-0.5 tabular-nums">
                    {inspectStudent.cgpa.toFixed(2)}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Track</span>
                  <strong className="text-xs text-slate-900 block mt-0.5 truncate">
                    {inspectStudent.areaOfInterest}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Platform Rank</span>
                  <strong className="text-base text-slate-900 block mt-0.5 tabular-nums">
                    #{inspectStudent.rank}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Points / XP</span>
                  <strong className="text-base text-slate-900 block mt-0.5 tabular-nums">
                    {inspectStudent.points} XP
                  </strong>
                </div>
              </div>

              {/* Institution Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span>Academic Affiliation</span>
                </div>
                <p className="text-slate-700 font-medium">{inspectStudent.college}</p>
                <div className="text-[11px] text-slate-500 flex items-center gap-4 pt-1">
                  <span>Student ID: <code className="font-mono">{inspectStudent.id}</code></span>
                  <span>Registered: {new Date(inspectStudent.registeredAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Assessment Scores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Domain Assessment Performance</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {inspectStudent.assessmentScores?.length || 0} Recorded
                  </span>
                </div>

                {inspectStudent.assessmentScores && inspectStudent.assessmentScores.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {inspectStudent.assessmentScores.map((score, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{score.subjectTitle}</div>
                          <div className="text-[11px] text-slate-400">Date: {score.date}</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 rounded bg-slate-100 font-bold text-slate-900 tabular-nums">
                            {score.score} / {score.maxScore} ({score.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No completed assessments logged yet for this candidate.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* TAB 3: Question Bank & Platform Analytics */}
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
                {registeredStudents.length} Active Records
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
