import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStudentScore,
  computeStudentRank,
  calculateDomainReadiness,
  generateCredentialId,
  filterLeaderboard,
  StudentLeaderboardEntry,
  getTrackRoadmap,
  calculateRoadmapProgress,
  evaluateStudentBadges,
  toggleResourceBookmark,
  filterResources,
} from './careerLogic.ts';
import { SharedResource } from '../types/index.ts';

test('calculateStudentScore combines assessment results, tasks, courses and CGPA bonus', () => {
  const score = calculateStudentScore({
    cgpa: 9.0,
    assessmentScores: [
      { score: 9, maxScore: 10 }, // 90% of 250 = 225
      { score: 8, maxScore: 10 }, // 80% of 250 = 200
    ],
    completedTaskCount: 2, // 200
    completedCourseCount: 1, // 300
  });

  // 225 + 200 + 200 + 300 + (9.0 * 20 = 180) = 1105
  assert.equal(score, 1105);
});

test('computeStudentRank accurately places score in rank order', () => {
  const cohortScores = [1200, 1050, 900, 750, 500];

  assert.equal(computeStudentRank(1300, cohortScores), 1);
  assert.equal(computeStudentRank(1200, cohortScores), 1);
  assert.equal(computeStudentRank(1000, cohortScores), 3);
  assert.equal(computeStudentRank(400, cohortScores), 6);
});

test('calculateDomainReadiness outputs score and appropriate tier', () => {
  const elite = calculateDomainReadiness(9.5, 95, 5);
  assert.equal(elite.tier, 'Industry Elite');
  assert.ok(elite.percentage >= 88);

  const beginner = calculateDomainReadiness(6.0, 40, 1);
  assert.equal(beginner.tier, 'Foundational');
  assert.ok(beginner.percentage < 50);
});

test('generateCredentialId produces deterministic format', () => {
  const certId = generateCredentialId('REACT', 'stu-9876', 1700000000);
  assert.match(certId, /^CG-REAC-9876-\d+$/);
});

test('filterLeaderboard filters by track and correctly re-ranks', () => {
  const students: StudentLeaderboardEntry[] = [
    { id: '1', name: 'Alice', areaOfInterest: 'Frontend Developer', cgpa: 9.0, points: 1500, weeklyHours: 12 },
    { id: '2', name: 'Bob', areaOfInterest: 'Backend Developer', cgpa: 8.5, points: 1700, weeklyHours: 14 },
    { id: '3', name: 'Charlie', areaOfInterest: 'Frontend Developer', cgpa: 8.8, points: 1300, weeklyHours: 10 },
  ];

  const frontendOnly = filterLeaderboard(students, 'Frontend Developer');
  assert.equal(frontendOnly.length, 2);
  assert.equal(frontendOnly[0].name, 'Alice');
  assert.equal(frontendOnly[0].rank, 1);
  assert.equal(frontendOnly[1].name, 'Charlie');
  assert.equal(frontendOnly[1].rank, 2);

  const all = filterLeaderboard(students, 'all');
  assert.equal(all.length, 3);
  assert.equal(all[0].name, 'Bob');
  assert.equal(all[0].rank, 1);
});

test('getTrackRoadmap returns track-specific milestones', () => {
  const feRoadmap = getTrackRoadmap('Frontend Developer');
  assert.equal(feRoadmap.length, 5);
  assert.equal(feRoadmap[0].stage, 'Foundations');
  assert.equal(feRoadmap[1].requiredCourseId, 'course-fe');

  const beRoadmap = getTrackRoadmap('Backend Developer');
  assert.equal(beRoadmap.length, 5);
  assert.equal(beRoadmap[1].requiredCourseId, 'course-be');
});

test('calculateRoadmapProgress computes completed and in-progress steps correctly', () => {
  const feMilestones = getTrackRoadmap('Frontend Developer');

  // Student has completed FE assessment and FE course, but not tasks
  const result = calculateRoadmapProgress(
    feMilestones,
    ['course-fe'], // completedCourseIds
    [], // completedTaskIds
    ['subj-fe'] // completedAssessmentSubjectIds
  );

  assert.equal(result.totalCount, 5);
  assert.equal(result.completedCount, 2);
  assert.equal(result.percentage, 40);
  assert.equal(result.milestones[0].status, 'completed');
  assert.equal(result.milestones[1].status, 'completed');
  assert.equal(result.milestones[2].status, 'in_progress');
  assert.equal(result.milestones[3].status, 'upcoming');
  assert.equal(result.currentMilestone?.id, 'fe-m3');
});

test('evaluateStudentBadges correctly awards Top 10% Rank, Course Expert, and Community Contributor', () => {
  const badges = evaluateStudentBadges({
    rank: 4,
    totalStudents: 1280,
    cgpa: 8.8,
    completedCourseIds: ['course-fe'],
    completedTaskIds: ['task-1', 'task-2'],
    assessmentScores: [{ percentage: 90 }],
    sharedResourcesCount: 1,
  });

  const top10 = badges.find((b) => b.id === 'badge-top-10');
  const courseExp = badges.find((b) => b.id === 'badge-course-expert');
  const commContrib = badges.find((b) => b.id === 'badge-community-contributor');
  const taskMaster = badges.find((b) => b.id === 'badge-task-master');

  assert.equal(top10?.isUnlocked, true);
  assert.equal(top10?.title, 'Top 10% Rank');
  assert.equal(courseExp?.isUnlocked, true);
  assert.equal(courseExp?.title, 'Course Expert');
  assert.equal(commContrib?.isUnlocked, true);
  assert.equal(commContrib?.title, 'Community Contributor');
  assert.equal(taskMaster?.isUnlocked, true);
});

test('toggleResourceBookmark adds and removes resource IDs correctly', () => {
  const initial: string[] = ['res-1', 'res-2'];

  // Toggle off res-1
  const step1 = toggleResourceBookmark(initial, 'res-1');
  assert.equal(step1.isBookmarked, false);
  assert.deepEqual(step1.updatedIds, ['res-2']);

  // Toggle on res-3
  const step2 = toggleResourceBookmark(step1.updatedIds, 'res-3');
  assert.equal(step2.isBookmarked, true);
  assert.deepEqual(step2.updatedIds, ['res-2', 'res-3']);
});

test('filterResources filters saved resources and handles categories and search queries', () => {
  const sampleResources: SharedResource[] = [
    {
      id: 'res-1',
      title: 'React 19 Server Components Cheatsheet',
      category: 'Frontend Engineering',
      authorName: 'Aarav Sharma',
      authorRole: 'Student (8.8 CGPA)',
      description: 'Quick reference for Actions, useActionState, and async transitions.',
      linkUrl: 'https://github.com/react-19-cheatsheet',
      fileType: 'CheatSheet',
      upvotes: 42,
      date: '2026-10-25',
    },
    {
      id: 'res-2',
      title: 'PostgreSQL Indexing & Execution Plans',
      category: 'Backend Engineering',
      authorName: 'Rahul Verma',
      authorRole: 'Student (9.1 CGPA)',
      description: 'Comprehensive guide to EXPLAIN ANALYZE and B-Tree vs GIN.',
      linkUrl: 'https://github.com/postgres-guide',
      fileType: 'PDF',
      upvotes: 67,
      date: '2026-10-24',
    },
    {
      id: 'res-3',
      title: 'System Design Mock Interview Transcripts',
      category: 'System Design',
      authorName: 'Prof. Neha Gupta',
      authorRole: 'Faculty Advisor',
      description: 'Real mock interview sessions for distributed cache invalidation.',
      linkUrl: 'https://notes.careergenius.edu/sys-design',
      fileType: 'Notes',
      upvotes: 83,
      date: '2026-10-28',
    },
  ];

  // Test bookmarkedOnly filter
  const saved = filterResources(sampleResources, {
    bookmarkedOnly: true,
    bookmarkedIds: ['res-1', 'res-3'],
  });
  assert.equal(saved.length, 2);
  assert.equal(saved[0].id, 'res-1');
  assert.equal(saved[1].id, 'res-3');

  // Test bookmarkedOnly combined with category
  const savedFrontend = filterResources(sampleResources, {
    bookmarkedOnly: true,
    bookmarkedIds: ['res-1', 'res-3'],
    category: 'Frontend Engineering',
  });
  assert.equal(savedFrontend.length, 1);
  assert.equal(savedFrontend[0].id, 'res-1');

  // Test search query
  const searchResult = filterResources(sampleResources, {
    searchQuery: 'PostgreSQL',
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 'res-2');
});
