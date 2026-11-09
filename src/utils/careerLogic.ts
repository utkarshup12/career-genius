/**
 * Career Genius - Pure Business & Scoring Logic
 */

import type { SharedResource } from '../types/index.ts';

export interface AssessmentResult {
  score: number;
  maxScore: number;
}

export interface StudentScoreInput {
  cgpa: number;
  assessmentScores: AssessmentResult[];
  completedTaskCount: number;
  completedCourseCount: number;
}

/**
 * Calculates student total platform XP/Points based on assessments, tasks, and courses.
 */
export function calculateStudentScore(input: StudentScoreInput): number {
  const assessmentPoints = input.assessmentScores.reduce((sum, curr) => {
    const pct = curr.maxScore > 0 ? curr.score / curr.maxScore : 0;
    return sum + Math.round(pct * 250);
  }, 0);

  const taskPoints = input.completedTaskCount * 100;
  const coursePoints = input.completedCourseCount * 300;
  // CGPA bonus (scaled from 0 to 10 CGPA -> up to 200 pts)
  const cgpaBonus = Math.round(Math.min(10, Math.max(0, input.cgpa)) * 20);

  return assessmentPoints + taskPoints + coursePoints + cgpaBonus;
}

/**
 * Computes 1-based platform rank given student score and all platform student scores.
 */
export function computeStudentRank(targetScore: number, allScores: number[]): number {
  if (allScores.length === 0) return 1;
  const sorted = [...allScores].sort((a, b) => b - a);
  const index = sorted.findIndex((score) => targetScore >= score);
  return index === -1 ? sorted.length + 1 : index + 1;
}

/**
 * Computes career readiness percentage based on CGPA, assessment mastery, and practical tasks.
 */
export function calculateDomainReadiness(
  cgpa: number,
  assessmentAveragePercentage: number,
  completedTasksCount: number
): { percentage: number; tier: 'Foundational' | 'Intermediate' | 'Job Ready' | 'Industry Elite' } {
  const cgpaWeight = (Math.min(10, Math.max(0, cgpa)) / 10) * 30; // 30% weight
  const assessmentWeight = (Math.min(100, Math.max(0, assessmentAveragePercentage)) / 100) * 45; // 45% weight
  const taskWeight = Math.min(25, completedTasksCount * 5); // 25% weight (5 tasks = max)

  const total = Math.round(cgpaWeight + assessmentWeight + taskWeight);
  const clamped = Math.min(100, Math.max(5, total));

  let tier: 'Foundational' | 'Intermediate' | 'Job Ready' | 'Industry Elite' = 'Foundational';
  if (clamped >= 88) {
    tier = 'Industry Elite';
  } else if (clamped >= 72) {
    tier = 'Job Ready';
  } else if (clamped >= 50) {
    tier = 'Intermediate';
  }

  return { percentage: clamped, tier };
}

/**
 * Generates a standard formatted verification credential ID for certificates.
 */
export function generateCredentialId(courseCode: string, studentId: string, timestamp = Date.now()): string {
  const cleanCode = courseCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'CERT';
  const cleanId = studentId.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase() || 'STD1';
  const timeHash = (timestamp % 100000).toString().padStart(5, '0');
  return `CG-${cleanCode}-${cleanId}-${timeHash}`;
}

export interface StudentLeaderboardEntry {
  id: string;
  name: string;
  areaOfInterest: string;
  cgpa: number;
  points: number;
  weeklyHours: number;
}

/**
 * Filters and sorts leaderboard entries by track.
 */
export function filterLeaderboard(
  students: StudentLeaderboardEntry[],
  trackFilter: string
): (StudentLeaderboardEntry & { rank: number })[] {
  const filtered = trackFilter === 'all'
    ? [...students]
    : students.filter((s) => s.areaOfInterest.toLowerCase() === trackFilter.toLowerCase());

  const sorted = filtered.sort((a, b) => b.points - a.points);
  return sorted.map((student, idx) => ({
    ...student,
    rank: idx + 1,
  }));
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  title: string;
  stage: 'Foundations' | 'Specialization' | 'Applied Projects' | 'Capstone & Placement';
  description: string;
  estimatedWeeks: number;
  requiredCourseId?: string;
  requiredTaskId?: string;
  requiredAssessmentSubjectId?: string;
  skills: string[];
  actionType: 'assessment' | 'course' | 'task' | 'feedback' | 'interview';
  actionTarget: string;
  deliverableName: string;
}

export interface RoadmapProgressResult {
  milestones: (RoadmapMilestone & {
    status: 'completed' | 'in_progress' | 'upcoming';
    isUnlocked: boolean;
  })[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  currentMilestone: RoadmapMilestone | null;
}

/**
 * Returns the curated step-by-step milestone roadmap for a specific career track.
 */
export function getTrackRoadmap(track: string): RoadmapMilestone[] {
  const norm = track.toLowerCase();

  if (norm.includes('front')) {
    return [
      {
        id: 'fe-m1',
        stepNumber: 1,
        title: 'Foundations: Modern Web & Algorithm Basics',
        stage: 'Foundations',
        description: 'Prove baseline mastery of JavaScript event loop, DOM tree diffing, and algorithmic problem-solving.',
        estimatedWeeks: 2,
        requiredAssessmentSubjectId: 'subj-fe',
        skills: ['JavaScript ES2024', 'DOM Reconciliation', 'Time Complexity'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'Frontend Core Assessment (Score >= 75%)',
      },
      {
        id: 'fe-m2',
        stepNumber: 2,
        title: 'Specialization: React 19 Architecture & Performance',
        stage: 'Specialization',
        description: 'Master concurrent transition scheduling, Server Actions, headless accessible design systems, and Web Vitals.',
        estimatedWeeks: 4,
        requiredCourseId: 'course-fe',
        skills: ['React 19', 'Compiler Auto-memoization', 'Tailwind CSS', 'CLS/LCP Profiling'],
        actionType: 'course',
        actionTarget: 'courses',
        deliverableName: 'Frontend Mastery Course Completion & Verified Credential',
      },
      {
        id: 'fe-m3',
        stepNumber: 3,
        title: 'Applied Engineering: Zero-Layout-Shift Dashboard',
        stage: 'Applied Projects',
        description: 'Construct a responsive, memoized analytics dashboard with zero cumulative layout shift and 60 FPS scrolling.',
        estimatedWeeks: 2,
        requiredTaskId: 'task-2',
        skills: ['Virtualization', 'Performance Profiler', 'Mobile Reflow', 'State Machines'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #2: Responsive Dashboard Deliverable',
      },
      {
        id: 'fe-m4',
        stepNumber: 4,
        title: 'Full-Stack Integration: Auth & Secure Session Handshakes',
        stage: 'Applied Projects',
        description: 'Bridge client interfaces with secure session endpoints, OAuth PKCE flows, and token rotation.',
        estimatedWeeks: 3,
        requiredTaskId: 'task-1',
        skills: ['OAuth 2.0 PKCE', 'JWT Rotation', 'HTTP Cookies', 'Defensive Error Boundaries'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #1: OAuth 2.0 PKCE Deliverable',
      },
      {
        id: 'fe-m5',
        stepNumber: 5,
        title: 'Capstone & Placement: Comprehensive Technical Portfolio Defense',
        stage: 'Capstone & Placement',
        description: 'Finalize production project portfolio, pass cross-domain technical challenges, and conduct peer mock interview sessions.',
        estimatedWeeks: 2,
        skills: ['System Design for Frontend', 'Web Vitals Defense', 'Behavioral Alignment'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'Final Capstone Technical Assessment & Placement Clearance',
      },
    ];
  }

  if (norm.includes('back')) {
    return [
      {
        id: 'be-m1',
        stepNumber: 1,
        title: 'Foundations: Relational Databases & ACID Transactions',
        stage: 'Foundations',
        description: 'Validate deep knowledge of database isolation levels, B-Trees vs Hash indexes, and query execution plans.',
        estimatedWeeks: 2,
        requiredAssessmentSubjectId: 'subj-be',
        skills: ['PostgreSQL', 'ACID Transactions', 'B-Tree Indexing', 'REST Standards'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'Backend & Database Assessment (Score >= 75%)',
      },
      {
        id: 'be-m2',
        stepNumber: 2,
        title: 'Specialization: Distributed Systems & Cache Invalidation',
        stage: 'Specialization',
        description: 'Architect resilient backend services with Redis caching, cache stampede prevention, and message queues.',
        estimatedWeeks: 5,
        requiredCourseId: 'course-be',
        skills: ['Redis Caching', 'Message Brokers (Kafka/RabbitMQ)', 'Idempotency', 'gRPC/REST'],
        actionType: 'course',
        actionTarget: 'courses',
        deliverableName: 'Distributed Backend Course Completion & Verified Credential',
      },
      {
        id: 'be-m3',
        stepNumber: 3,
        title: 'Applied Engineering: OAuth 2.0 PKCE & Refresh Tokens',
        stage: 'Applied Projects',
        description: 'Build a production-grade session exchange with rotating refresh tokens and httpOnly cookies.',
        estimatedWeeks: 2,
        requiredTaskId: 'task-1',
        skills: ['OAuth 2.0 PKCE', 'JWT Refresh Chains', 'Express Middleware', 'Security Headers'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #1: OAuth 2.0 PKCE Implementation',
      },
      {
        id: 'be-m4',
        stepNumber: 4,
        title: 'Data Architecture: Normalized 3NF & Execution Tuning',
        stage: 'Applied Projects',
        description: 'Design normalized schemas, index foreign keys, and demonstrate index scans over sequential scans with EXPLAIN ANALYZE.',
        estimatedWeeks: 3,
        requiredTaskId: 'task-3',
        skills: ['PostgreSQL 3NF Schema', 'EXPLAIN ANALYZE', 'Partial Indexing', 'WAL Mechanics'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #3: 3NF Database & Query Optimization',
      },
      {
        id: 'be-m5',
        stepNumber: 5,
        title: 'Capstone & Placement: High-Concurrency System Design',
        stage: 'Capstone & Placement',
        description: 'Demonstrate microservice scalability designs, distributed cache resilience, and pass system design interview rounds.',
        estimatedWeeks: 2,
        skills: ['Microservice Architecture', 'Distributed Lock Strategies', 'Interview Defense'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'System Design Benchmark Assessment & Clearance',
      },
    ];
  }

  if (norm.includes('ai') || norm.includes('ml') || norm.includes('data')) {
    return [
      {
        id: 'ai-m1',
        stepNumber: 1,
        title: 'Foundations: Model Evaluation & Vector Mathematics',
        stage: 'Foundations',
        description: 'Demonstrate proficiency in precision-recall trade-offs, vector similarity metrics, and Transformer residual connections.',
        estimatedWeeks: 2,
        requiredAssessmentSubjectId: 'subj-ai',
        skills: ['F1 / PR-AUC', 'Cosine Similarity', 'Transformer Attention', 'Logit Temperature'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'AI & Machine Learning Assessment (Score >= 75%)',
      },
      {
        id: 'ai-m2',
        stepNumber: 2,
        title: 'Specialization: Applied AI & Gemini Systems Engineering',
        stage: 'Specialization',
        description: 'Bridge research models into production with vector search databases, RAG chunking pipelines, and @google/genai SDK.',
        estimatedWeeks: 4,
        requiredCourseId: 'course-ai',
        skills: ['Vector Databases (HNSW)', 'Two-Stage RAG', '@google/genai SDK', 'Prompt Guardrails'],
        actionType: 'course',
        actionTarget: 'courses',
        deliverableName: 'Applied AI Engineering Course & Verified Credential',
      },
      {
        id: 'ai-m3',
        stepNumber: 3,
        title: 'Applied Engineering: Vector Search & Embeddings Pipeline',
        stage: 'Applied Projects',
        description: 'Build an embedding retrieval pipeline indexing technical literature and answering queries with cosine similarity ranking.',
        estimatedWeeks: 3,
        requiredTaskId: 'task-5',
        skills: ['High-Dimensional Embeddings', 'Cosine Search', 'Semantic Chunking', 'Latency Benchmarking'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #5: Vector Search Pipeline Deliverable',
      },
      {
        id: 'ai-m4',
        stepNumber: 4,
        title: 'Deployment: Multi-Stage Containerization & Model APIs',
        stage: 'Applied Projects',
        description: 'Package your AI microservice with multi-stage Docker builds and minimal Linux runtime footprint.',
        estimatedWeeks: 2,
        requiredTaskId: 'task-4',
        skills: ['Docker Multi-stage', 'Inference Optimization', 'API Gateways'],
        actionType: 'task',
        actionTarget: 'resources',
        deliverableName: 'Task #4: Containerized Inference Service',
      },
      {
        id: 'ai-m5',
        stepNumber: 5,
        title: 'Capstone & Placement: LLM Observability & Production Review',
        stage: 'Capstone & Placement',
        description: 'Demonstrate hallucination guardrails, token budget optimization, and complete advanced AI diagnostic assessment.',
        estimatedWeeks: 2,
        skills: ['RAG Triad Evaluation', 'Model Drift Observability', 'Technical Defense'],
        actionType: 'assessment',
        actionTarget: 'assessments',
        deliverableName: 'AI Model Defense & Placement Clearance',
      },
    ];
  }

  // Default / Software Developer / DevOps track
  return [
    {
      id: 'sw-m1',
      stepNumber: 1,
      title: 'Foundations: Algorithms & Algorithmic Problem Solving',
      stage: 'Foundations',
      description: 'Master core computational algorithms, QuickSort partitioning complexities, Dijkstra paths, and dynamic programming.',
      estimatedWeeks: 2,
      requiredAssessmentSubjectId: 'subj-dsa',
      skills: ['QuickSort / Dijkstra', 'Hash Tables', 'Dynamic Programming', 'Complexity Theory'],
      actionType: 'assessment',
      actionTarget: 'assessments',
      deliverableName: 'DSA Assessment (Score >= 75%)',
    },
    {
      id: 'sw-m2',
      stepNumber: 2,
      title: 'Specialization: Frontend & Backend Systems Engineering',
      stage: 'Specialization',
      description: 'Gain holistic mastery of web client state machines and cloud database backends.',
      estimatedWeeks: 4,
      requiredCourseId: 'course-fe',
      skills: ['Full Stack Architecture', 'REST/gRPC APIs', 'Database Transactions', 'React 19'],
      actionType: 'course',
      actionTarget: 'courses',
      deliverableName: 'Engineering Course Completion & Certificate',
    },
    {
      id: 'sw-m3',
      stepNumber: 3,
      title: 'Applied Engineering: Authentication & Containerization',
      stage: 'Applied Projects',
      description: 'Implement end-to-end OAuth 2.0 PKCE authentication and package containers via Docker multi-stage builds.',
      estimatedWeeks: 3,
      requiredTaskId: 'task-1',
      skills: ['OAuth 2.0 PKCE', 'Docker Multi-stage', 'CI/CD Pipelines'],
      actionType: 'task',
      actionTarget: 'resources',
      deliverableName: 'Tasks #1 & #4: Production Auth & Containers',
    },
    {
      id: 'sw-m4',
      stepNumber: 4,
      title: 'Data & Performance: Relational Schema & UI Optimization',
      stage: 'Applied Projects',
      description: 'Design normalized 3NF schemas with index query plans and build zero-layout-shift responsive interfaces.',
      estimatedWeeks: 3,
      requiredTaskId: 'task-2',
      skills: ['3NF Normalization', 'Web Vitals Optimization', 'Query Execution Tuning'],
      actionType: 'task',
      actionTarget: 'resources',
      deliverableName: 'Task #2: Responsive Dashboard Deliverable',
    },
    {
      id: 'sw-m5',
      stepNumber: 5,
      title: 'Capstone & Placement: Full Spectrum Technical Placement Clearance',
      stage: 'Capstone & Placement',
      description: 'Complete cross-domain assessments, refine portfolio projects, and verify platform certification benchmarks.',
      estimatedWeeks: 2,
      skills: ['System Design Defense', 'Behavioral Interviews', 'Code Reviews'],
      actionType: 'assessment',
      actionTarget: 'assessments',
      deliverableName: 'Platform Certification & Placement Clearance',
    },
  ];
}

/**
 * Computes live milestone status (completed, in_progress, upcoming) and completion percentage.
 */
export function calculateRoadmapProgress(
  milestones: RoadmapMilestone[],
  completedCourseIds: string[],
  completedTaskIds: string[],
  completedAssessmentSubjectIds: string[]
): RoadmapProgressResult {
  let firstUncompletedFound = false;
  let completedCount = 0;

  const milestonesWithStatus = milestones.map((m) => {
    let isComplete = false;

    // Check prerequisites
    const courseOk = !m.requiredCourseId || completedCourseIds.includes(m.requiredCourseId);
    const taskOk = !m.requiredTaskId || completedTaskIds.includes(m.requiredTaskId);
    const asmtOk =
      !m.requiredAssessmentSubjectId || completedAssessmentSubjectIds.includes(m.requiredAssessmentSubjectId);

    // If milestone has defined requirements, check if they are satisfied
    if (m.requiredCourseId || m.requiredTaskId || m.requiredAssessmentSubjectId) {
      isComplete = courseOk && taskOk && asmtOk;
    } else {
      // Final capstone requires at least 2 courses and 2 tasks completed
      isComplete = completedCourseIds.length >= 1 && completedTaskIds.length >= 2;
    }

    if (isComplete) {
      completedCount++;
      return {
        ...m,
        status: 'completed' as const,
        isUnlocked: true,
      };
    }

    if (!firstUncompletedFound) {
      firstUncompletedFound = true;
      return {
        ...m,
        status: 'in_progress' as const,
        isUnlocked: true,
      };
    }

    return {
      ...m,
      status: 'upcoming' as const,
      isUnlocked: false,
    };
  });

  const totalCount = milestones.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentMilestone =
    milestonesWithStatus.find((m) => m.status === 'in_progress') ||
    milestonesWithStatus[milestonesWithStatus.length - 1] ||
    null;

  return {
    milestones: milestonesWithStatus,
    completedCount,
    totalCount,
    percentage,
    currentMilestone,
  };
}

export interface BadgeEvaluationInput {
  rank: number;
  totalStudents: number;
  cgpa: number;
  completedCourseIds: string[];
  completedTaskIds: string[];
  assessmentScores: { percentage: number }[];
  sharedResourcesCount: number;
}

export interface EvaluatedBadge {
  id: string;
  title: string;
  category: 'ranking' | 'courses' | 'community' | 'assessment' | 'tasks' | 'academic';
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  progress: {
    current: number;
    max: number;
    unit: string;
  };
}

/**
 * Pure evaluation function that calculates unlocked badges and progress toward locked badges.
 */
export function evaluateStudentBadges(input: BadgeEvaluationInput): EvaluatedBadge[] {
  const top10Threshold = Math.max(1, Math.ceil(input.totalStudents * 0.10));
  const isTop10 = input.rank > 0 && input.rank <= top10Threshold;

  const hasCourse = input.completedCourseIds.length >= 1;
  const hasShared = input.sharedResourcesCount >= 1;
  const bestAssessmentPct = input.assessmentScores.reduce((max, s) => Math.max(max, s.percentage), 0);
  const isAssessmentAce = bestAssessmentPct >= 85;
  const isTaskMaster = input.completedTaskIds.length >= 2;
  const isAcademicScholar = input.cgpa >= 8.5;

  return [
    {
      id: 'badge-top-10',
      title: 'Top 10% Rank',
      category: 'ranking',
      description: `Ranked in the top 10th percentile globally (#${input.rank} of ${input.totalStudents} students).`,
      iconName: 'Trophy',
      isUnlocked: isTop10,
      unlockedAt: isTop10 ? '2026-10-25' : undefined,
      rarity: 'Legendary',
      progress: {
        current: Math.max(0, input.totalStudents - input.rank + 1),
        max: input.totalStudents,
        unit: 'Rank Percentile',
      },
    },
    {
      id: 'badge-course-expert',
      title: 'Course Expert',
      category: 'courses',
      description: 'Completed an accredited multi-week specialization course and earned a verified credential.',
      iconName: 'Award',
      isUnlocked: hasCourse,
      unlockedAt: hasCourse ? '2026-10-26' : undefined,
      rarity: 'Epic',
      progress: {
        current: input.completedCourseIds.length,
        max: 1,
        unit: 'Course',
      },
    },
    {
      id: 'badge-community-contributor',
      title: 'Community Contributor',
      category: 'community',
      description: 'Shared verified engineering notes, cheatsheets, or repositories to empower peers.',
      iconName: 'Share2',
      isUnlocked: hasShared,
      unlockedAt: hasShared ? '2026-10-27' : undefined,
      rarity: 'Rare',
      progress: {
        current: input.sharedResourcesCount,
        max: 1,
        unit: 'Resource',
      },
    },
    {
      id: 'badge-assessment-ace',
      title: 'Assessment Ace',
      category: 'assessment',
      description: 'Achieved an outstanding 85%+ accuracy score on a timed domain skills assessment.',
      iconName: 'CheckCircle2',
      isUnlocked: isAssessmentAce,
      unlockedAt: isAssessmentAce ? '2026-10-25' : undefined,
      rarity: 'Rare',
      progress: {
        current: bestAssessmentPct,
        max: 85,
        unit: '% Score',
      },
    },
    {
      id: 'badge-task-master',
      title: 'Task Master',
      category: 'tasks',
      description: 'Successfully implemented and delivered 2 or more production coding challenges.',
      iconName: 'ListTodo',
      isUnlocked: isTaskMaster,
      unlockedAt: isTaskMaster ? '2026-10-28' : undefined,
      rarity: 'Rare',
      progress: {
        current: input.completedTaskIds.length,
        max: 2,
        unit: 'Tasks',
      },
    },
    {
      id: 'badge-academic-honor',
      title: 'Academic Scholar',
      category: 'academic',
      description: 'Maintained a distinguished university cumulative grade point average of 8.50+.',
      iconName: 'GraduationCap',
      isUnlocked: isAcademicScholar,
      unlockedAt: isAcademicScholar ? '2026-10-20' : undefined,
      rarity: 'Common',
      progress: {
        current: Number(input.cgpa.toFixed(2)),
        max: 8.5,
        unit: 'CGPA',
      },
    },
  ];
}

/**
 * Pure function to filter resources by category, bookmark status, and search query.
 */
export function filterResources(
  resources: SharedResource[],
  options: {
    category?: string;
    bookmarkedOnly?: boolean;
    bookmarkedIds?: string[];
    searchQuery?: string;
  }
): SharedResource[] {
  const { category = 'all', bookmarkedOnly = false, bookmarkedIds = [], searchQuery = '' } = options;
  const q = searchQuery.toLowerCase().trim();

  return resources.filter((res) => {
    // Check bookmark state
    const isSaved = res.isBookmarked ?? bookmarkedIds.includes(res.id);
    if (bookmarkedOnly && !isSaved) {
      return false;
    }

    // Check category
    if (category !== 'all' && !res.category.toLowerCase().includes(category.toLowerCase())) {
      return false;
    }

    // Check query
    if (q) {
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchDesc = res.description.toLowerCase().includes(q);
      const matchAuthor = res.authorName.toLowerCase().includes(q);
      const matchCategory = res.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor && !matchCategory) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Pure function to toggle a resource ID in the student's bookmarked collection.
 */
export function toggleResourceBookmark(
  currentBookmarkIds: string[] = [],
  resourceId: string
): { updatedIds: string[]; isBookmarked: boolean } {
  const exists = currentBookmarkIds.includes(resourceId);
  const updatedIds = exists
    ? currentBookmarkIds.filter((id) => id !== resourceId)
    : [...currentBookmarkIds, resourceId];

  return {
    updatedIds,
    isBookmarked: !exists,
  };
}
