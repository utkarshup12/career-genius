export type UserRole = 'student' | 'teacher' | 'admin';

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'ranking' | 'courses' | 'community' | 'assessment' | 'tasks' | 'academic';
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  progress?: {
    current: number;
    max: number;
    unit: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cgpa: number;
  areaOfInterest: string;
  college: string;
  graduationYear: number;
  points: number;
  rank: number;
  weeklyActivity: { day: string; studyHours: number; score: number }[];
  completedCourseIds: string[];
  completedTaskIds: string[];
  bookmarkedResourceIds?: string[];
  assessmentScores: {
    assessmentId: string;
    subjectTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    date: string;
  }[];
  badges?: AchievementBadge[];
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Subject {
  id: string;
  title: string;
  iconName: string;
  description: string;
  questionCount: number;
}

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  subjectTitle: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  totalMarks: number;
  questions: Question[];
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  summary: string;
  keyConcepts: string[];
  practicalChallenge: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  track: string;
  instructor: string;
  instructorRole: string;
  duration: string;
  level: string;
  description: string;
  imageKey: string;
  modules: CourseModule[];
  skillsGained: string[];
}

export interface CareerTask {
  id: string;
  title: string;
  track: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  description: string;
  deliverable: string;
  estimatedHours: number;
}

export interface TeacherFeedback {
  id: string;
  studentId: string;
  studentName: string;
  teacherName: string;
  teacherRole: string;
  subject: string;
  date: string;
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
}

export interface PeerMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderCgpa?: number;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface PeerSummary {
  id: string;
  name: string;
  cgpa: number;
  areaOfInterest: string;
  college: string;
  lastMessage: string;
  lastTimestamp: string | null;
}

export interface SharedResource {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: string;
  description: string;
  linkUrl: string;
  fileType: 'PDF' | 'GitHub' | 'Notes' | 'CheatSheet';
  upvotes: number;
  date: string;
  userUpvoted?: boolean;
  isBookmarked?: boolean;
}

export interface LeaderboardStudent {
  id: string;
  name: string;
  email: string;
  cgpa: number;
  areaOfInterest: string;
  college: string;
  points: number;
  rank: number;
  weeklyActivity: { day: string; studyHours: number; score: number }[];
  completedCourseCount: number;
  completedTaskCount: number;
  assessmentCount: number;
}
