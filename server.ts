import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { evaluateStudentBadges } from './src/utils/careerLogic.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize server-side Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// In-Memory Persistent Data Store
// ==========================================

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
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
  badges: any[];
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

// Initial Database Seeding
const subjects: Subject[] = [
  {
    id: 'subj-fe',
    title: 'Frontend Architecture & Modern Web',
    iconName: 'Layout',
    description: 'DOM APIs, React 19 reconciliation, rendering lifecycle, CSS layouts, and web performance.',
    questionCount: 4,
  },
  {
    id: 'subj-be',
    title: 'Backend Systems & Database Architecture',
    iconName: 'Database',
    description: 'Relational 3NF indexing, ACID transactions, distributed caching, and REST/gRPC APIs.',
    questionCount: 4,
  },
  {
    id: 'subj-dsa',
    title: 'Data Structures & Algorithms',
    iconName: 'Code2',
    description: 'Time complexity, dynamic programming, graph traversals, and algorithmic problem solving.',
    questionCount: 4,
  },
  {
    id: 'subj-cloud',
    title: 'Cloud Infrastructure & DevOps',
    iconName: 'Cloud',
    description: 'Docker multi-stage builds, CI/CD pipelines, Kubernetes primitives, and zero-downtime deployment.',
    questionCount: 4,
  },
  {
    id: 'subj-ai',
    title: 'Machine Learning & AI Engineering',
    iconName: 'Cpu',
    description: 'Model evaluation metrics, embeddings, vector search, and LLM orchestration.',
    questionCount: 4,
  },
];

const initialQuestions: Question[] = [
  // Frontend
  {
    id: 'q-fe-1',
    subjectId: 'subj-fe',
    question: 'In modern React, how does the Virtual DOM reconciliation algorithm optimize tree diffing?',
    options: [
      'By performing an O(n^3) combinatorial diff across all deep nodes',
      'By assuming elements of different types produce different trees and using stable "key" props for list reconciliation',
      'By reloading the entire iframe viewport on each state modification',
      'By bypassing browser paint pipelines and rendering directly to canvas'
    ],
    correctIndex: 1,
    explanation: 'React uses heuristic O(n) algorithms: elements of different types produce different trees, and the developer can hint which child elements are stable across renders with a key prop.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-fe-2',
    subjectId: 'subj-fe',
    question: 'Which CSS property creates a new stacking context without requiring a z-index declaration?',
    options: [
      'display: flex',
      'margin: auto',
      'opacity less than 1 (e.g., opacity: 0.99) or transform',
      'font-weight: bold'
    ],
    correctIndex: 2,
    explanation: 'An element with opacity less than 1 or a CSS transform property creates a new stacking context in the browser compositing layer.',
    difficulty: 'Advanced',
  },
  {
    id: 'q-fe-3',
    subjectId: 'subj-fe',
    question: 'What is the primary benefit of the JavaScript Event Loop microtask queue over the macrotask queue?',
    options: [
      'Microtasks run asynchronously in a separate background thread on the GPU',
      'Microtasks (e.g. Promises, queueMicrotask) execute immediately after the currently running script and before browser rendering or next macrotask',
      'Microtasks never block the main thread under any circumstance',
      'Microtasks only process DOM click events'
    ],
    correctIndex: 1,
    explanation: 'Microtasks are processed immediately after the current macrotask finishes execution and before the browser renders the next animation frame.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-fe-4',
    subjectId: 'subj-fe',
    question: 'When optimizing Core Web Vitals, which metric measures visual stability to prevent unexpected layout shifts?',
    options: ['LCP (Largest Contentful Paint)', 'FID (First Input Delay)', 'CLS (Cumulative Layout Shift)', 'TTFB (Time to First Byte)'],
    correctIndex: 2,
    explanation: 'CLS measures Cumulative Layout Shift, evaluating the sum total of all unexpected layout shifts that occur during the lifespan of the page.',
    difficulty: 'Beginner',
  },
  // Backend
  {
    id: 'q-be-1',
    subjectId: 'subj-be',
    question: 'In relational database design, what differentiates a B-Tree index from a Hash index in PostgreSQL?',
    options: [
      'Hash indexes support range queries (BETWEEN, <, >), whereas B-Trees do not',
      'B-Tree indexes maintain sorted keys and efficiently handle range scans and ordering, whereas Hash indexes only support equality lookups (=)',
      'B-Trees are stored in volatile RAM only',
      'Hash indexes require zero disk space'
    ],
    correctIndex: 1,
    explanation: 'B-Trees store data hierarchically sorted, making them optimal for equality (=), range queries (<, >, BETWEEN), and ORDER BY operations. Hash indexes only support simple equality.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-be-2',
    subjectId: 'subj-be',
    question: 'Under ACID database guarantees, which property ensures transactions survive system crashes or power failures once committed?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctIndex: 3,
    explanation: 'Durability ensures that once a transaction has committed, its changes are written to non-volatile storage (via Write-Ahead Logging/WAL) and survive power cuts or crashes.',
    difficulty: 'Beginner',
  },
  {
    id: 'q-be-3',
    subjectId: 'subj-be',
    question: 'What is the "Cache Stampede" (or Thundering Herd) problem in high-concurrency backend services, and how is it mitigated?',
    options: [
      'When cache memory overflows and deletes the database schema',
      'When a popular cached key expires and hundreds of concurrent requests query the database at the same time; mitigated via mutex locking or probabilistic early expiration',
      'When Redis cluster nodes become disconnected due to DNS latency',
      'When client browser cookies exceed 4KB'
    ],
    correctIndex: 1,
    explanation: 'Cache stampede happens when multiple parallel threads all observe a key miss simultaneously and hit the origin DB. It is mitigated using mutex locking (single-flight) or probabilistic early refreshing (XFetch).',
    difficulty: 'Advanced',
  },
  {
    id: 'q-be-4',
    subjectId: 'subj-be',
    question: 'Which HTTP status code should a RESTful API return when a client request fails schema validation (e.g., negative CGPA value)?',
    options: ['200 OK', '400 Bad Request (or 422 Unprocessable Content)', '500 Internal Server Error', '403 Forbidden'],
    correctIndex: 1,
    explanation: '400 Bad Request or 422 Unprocessable Content accurately indicates the server cannot process the request due to client validation failure.',
    difficulty: 'Beginner',
  },
  // DSA
  {
    id: 'q-dsa-1',
    subjectId: 'subj-dsa',
    question: 'What is the average and worst-case time complexity of QuickSort when using a naive first-element pivot on already sorted data?',
    options: [
      'Average: O(n log n), Worst-case: O(n^2)',
      'Average: O(n), Worst-case: O(n log n)',
      'Average: O(log n), Worst-case: O(n)',
      'Average: O(n^2), Worst-case: O(n^3)'
    ],
    correctIndex: 0,
    explanation: 'When a naive pivot is picked on sorted data, partitions degenerate into n and 0 elements, leading to O(n^2) worst case. Randomized pivots or Median-of-Three prevent this.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-dsa-2',
    subjectId: 'subj-dsa',
    question: 'Which algorithm is best suited to find the shortest path in a weighted graph with non-negative edge weights?',
    options: ['Bellman-Ford Algorithm', "Dijkstra's Algorithm with Min-Heap", 'Breadth-First Search (BFS)', 'Floyd-Warshall'],
    correctIndex: 1,
    explanation: "Dijkstra's algorithm with a priority queue/min-heap solves single-source shortest path in O((V + E) log V) for graphs with non-negative edge weights.",
    difficulty: 'Intermediate',
  },
  {
    id: 'q-dsa-3',
    subjectId: 'subj-dsa',
    question: 'What data structure provides O(1) amortized insertion, lookup, and deletion of key-value pairs?',
    options: ['Balanced Binary Search Tree (AVL)', 'Hash Table', 'Trie', 'Linked List'],
    correctIndex: 1,
    explanation: 'Hash tables offer O(1) average time complexity for insert, read, and delete operations via hash functions and bucket arrays.',
    difficulty: 'Beginner',
  },
  {
    id: 'q-dsa-4',
    subjectId: 'subj-dsa',
    question: 'In dynamic programming, which condition must a problem satisfy to be solvable via memoization or tabulation?',
    options: [
      'Linear dependency and random variance',
      'Optimal substructure and overlapping subproblems',
      'Complete graph connectivity and directed cycles',
      'Constant time execution'
    ],
    correctIndex: 1,
    explanation: 'Optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems (same subproblems solved multiple times) are the two core prerequisites.',
    difficulty: 'Advanced',
  },
  // Cloud & DevOps
  {
    id: 'q-cloud-1',
    subjectId: 'subj-cloud',
    question: 'What is the core benefit of Docker multi-stage builds in production CI/CD?',
    options: [
      'They combine multiple operating systems in a single running container',
      'They separate build-time dependencies (compilers, SDKs) from the final minimal runtime image, reducing image size and attack surface',
      'They run tests faster by disabling Linux security flags',
      'They remove the requirement for container registries'
    ],
    correctIndex: 1,
    explanation: 'Multi-stage builds allow you to use a heavy builder image for compiling and copy only the final built artifacts into a slim, secure Alpine/Distroless production image.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-cloud-2',
    subjectId: 'subj-cloud',
    question: 'In Kubernetes architecture, what is the role of the Kubelet on a worker node?',
    options: [
      'It manages global DNS routing across AWS regions',
      'It is the primary node agent that registers the node with the API server and ensures container pods are running as declared in PodSpecs',
      'It stores the cluster etcd consensus database',
      'It monitors cloud billing thresholds'
    ],
    correctIndex: 1,
    explanation: 'Kubelet is the node agent that communicates with the Kubernetes API server and instructs the container runtime (containerd) to start/stop containers according to PodSpecs.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-cloud-3',
    subjectId: 'subj-cloud',
    question: 'What deployment strategy routes a small percentage (e.g. 10%) of production traffic to a new version before rolling it out to 100% of users?',
    options: ['Blue/Green Deployment', 'Canary Deployment', 'Recreate Deployment', 'In-place Rolling Restart'],
    correctIndex: 1,
    explanation: 'Canary deployments gradually shift real user traffic to a new deployment version to monitor telemetry, error rates, and latency before complete rollout.',
    difficulty: 'Beginner',
  },
  {
    id: 'q-cloud-4',
    subjectId: 'subj-cloud',
    question: 'Which tool is industry standard for declaring Infrastructure as Code (IaC) across multiple cloud providers?',
    options: ['Terraform', 'Photoshop', 'Vite', 'Postman'],
    correctIndex: 0,
    explanation: 'HashiCorp Terraform allows engineers to declare, version, and orchestrate cloud infrastructure using declarative HCL configuration files.',
    difficulty: 'Beginner',
  },
  // AI & ML
  {
    id: 'q-ai-1',
    subjectId: 'subj-ai',
    question: 'What metric is preferable over simple Accuracy when evaluating classification models on heavily imbalanced datasets (e.g. fraud detection with 99.9% negative cases)?',
    options: ['F1-Score / PR-AUC (Precision-Recall Area Under Curve)', 'Mean Squared Error', 'Training Loss', 'Epoch Count'],
    correctIndex: 0,
    explanation: 'On imbalanced datasets, a naive model predicting only negative gets 99.9% accuracy. Precision, Recall, and F1-Score / PR-AUC accurately reflect minority class performance.',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-ai-2',
    subjectId: 'subj-ai',
    question: 'In modern Retrieval-Augmented Generation (RAG) architectures, how are semantic text documents retrieved?',
    options: [
      'By converting text into high-dimensional vector embeddings and performing cosine similarity or approximate nearest neighbor (ANN) search',
      'By sorting documents alphabetically by author name',
      'By running a regular expression match on all disk files sequentially',
      'By executing a SQL SELECT query with LIKE "%ai%"'
    ],
    correctIndex: 0,
    explanation: 'RAG systems embed text into vector representations and perform vector similarity search (e.g., Cosine Distance via HNSW/IVFFlat index in vector databases).',
    difficulty: 'Intermediate',
  },
  {
    id: 'q-ai-3',
    subjectId: 'subj-ai',
    question: 'What is the purpose of Temperature in LLM text generation sampling?',
    options: [
      'It controls the CPU temperature of the data center server',
      'It scales logits before softmax: lower temperature (< 0.3) makes output deterministic and focused, while higher temperature increases variety and randomness',
      'It sets the maximum context window token count',
      'It defines how many GPUs are allocated'
    ],
    correctIndex: 1,
    explanation: 'Temperature divides logits prior to softmax probability calculation. Low temperature concentrates probabilities on highest-likelihood tokens, while higher temperature flattens distribution.',
    difficulty: 'Beginner',
  },
  {
    id: 'q-ai-4',
    subjectId: 'subj-ai',
    question: 'What prevents vanishing or exploding gradients in deep Transformer architectures?',
    options: ['Residual skip connections and Layer Normalization', 'Increasing learning rate to 100', 'Using pure ReLU with no bias', 'Removing attention heads'],
    correctIndex: 0,
    explanation: 'Residual connections (x + Sublayer(x)) allow gradients to propagate directly across deep layers without vanishing, stabilized by Layer Normalization.',
    difficulty: 'Advanced',
  },
];

let questions: Question[] = [...initialQuestions];

const assessments: Assessment[] = [
  {
    id: 'asmt-fe',
    title: 'Frontend Engineering Core Assessment',
    subjectId: 'subj-fe',
    subjectTitle: 'Frontend Architecture & Modern Web',
    durationMinutes: 15,
    difficulty: 'Intermediate',
    description: 'Evaluate your mastery of React 19 architecture, DOM performance, CSS modern layouts, and Core Web Vitals.',
    totalMarks: 40,
    questions: questions.filter((q) => q.subjectId === 'subj-fe'),
  },
  {
    id: 'asmt-be',
    title: 'Distributed Backend & Database Assessment',
    subjectId: 'subj-be',
    subjectTitle: 'Backend Systems & Database Architecture',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    description: 'Test your understanding of ACID transactions, B-Tree vs Hash indexing, cache stampede prevention, and REST standards.',
    totalMarks: 40,
    questions: questions.filter((q) => q.subjectId === 'subj-be'),
  },
  {
    id: 'asmt-dsa',
    title: 'Data Structures & Algorithmic Problem Solving',
    subjectId: 'subj-dsa',
    subjectTitle: 'Data Structures & Algorithms',
    durationMinutes: 25,
    difficulty: 'Advanced',
    description: 'Prove your algorithmic precision in QuickSort partitioning, Dijkstra shortest paths, and dynamic programming.',
    totalMarks: 40,
    questions: questions.filter((q) => q.subjectId === 'subj-dsa'),
  },
  {
    id: 'asmt-cloud',
    title: 'DevOps & Cloud Systems Assessment',
    subjectId: 'subj-cloud',
    subjectTitle: 'Cloud Infrastructure & DevOps',
    durationMinutes: 15,
    difficulty: 'Intermediate',
    description: 'Assess production readiness in Docker multi-stage builds, Kubernetes node agents, and Canary deployments.',
    totalMarks: 40,
    questions: questions.filter((q) => q.subjectId === 'subj-cloud'),
  },
  {
    id: 'asmt-ai',
    title: 'Applied AI & Machine Learning Assessment',
    subjectId: 'subj-ai',
    subjectTitle: 'Machine Learning & AI Engineering',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    description: 'Gauge your competence in Transformer residual connections, RAG vector retrieval, and model evaluation metrics.',
    totalMarks: 40,
    questions: questions.filter((q) => q.subjectId === 'subj-ai'),
  },
];

// Current logged in user (student by default, switchable via UI)
let currentUser: UserProfile = {
  id: 'usr-student-aarav',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@campus.edu',
  role: 'student',
  cgpa: 8.8,
  areaOfInterest: 'Frontend Developer',
  college: 'National Institute of Technology',
  graduationYear: 2026,
  points: 1420,
  rank: 4,
  weeklyActivity: [
    { day: 'Mon', studyHours: 3.5, score: 180 },
    { day: 'Tue', studyHours: 4.2, score: 240 },
    { day: 'Wed', studyHours: 2.8, score: 120 },
    { day: 'Thu', studyHours: 5.0, score: 310 },
    { day: 'Fri', studyHours: 3.0, score: 190 },
    { day: 'Sat', studyHours: 6.5, score: 420 },
    { day: 'Sun', studyHours: 4.0, score: 260 },
  ],
  completedCourseIds: ['course-fe'],
  completedTaskIds: ['task-1', 'task-2'],
  assessmentScores: [
    {
      assessmentId: 'asmt-fe',
      subjectTitle: 'Frontend Architecture & Modern Web',
      score: 36,
      maxScore: 40,
      percentage: 90,
      date: '2026-10-25',
    },
    {
      assessmentId: 'asmt-dsa',
      subjectTitle: 'Data Structures & Algorithms',
      score: 32,
      maxScore: 40,
      percentage: 80,
      date: '2026-10-28',
    },
  ],
  bookmarkedResourceIds: ['res-1'],
  badges: [],
};

// Cohort of students for platform ranking and competition
const cohortStudents: UserProfile[] = [
  {
    id: 'usr-priya',
    name: 'Priya Patel',
    email: 'priya.patel@tech.edu',
    role: 'student',
    cgpa: 9.5,
    areaOfInterest: 'AI / ML Engineer',
    college: 'IIT Delhi',
    graduationYear: 2026,
    points: 1980,
    rank: 1,
    weeklyActivity: [
      { day: 'Mon', studyHours: 5, score: 300 },
      { day: 'Tue', studyHours: 6, score: 350 },
      { day: 'Wed', studyHours: 5.5, score: 320 },
      { day: 'Thu', studyHours: 6, score: 380 },
      { day: 'Fri', studyHours: 4.5, score: 280 },
      { day: 'Sat', studyHours: 7, score: 450 },
      { day: 'Sun', studyHours: 5, score: 320 },
    ],
    completedCourseIds: ['course-ai', 'course-be'],
    completedTaskIds: ['task-1', 'task-2', 'task-5'],
    assessmentScores: [{ assessmentId: 'asmt-ai', subjectTitle: 'Machine Learning & AI Engineering', score: 40, maxScore: 40, percentage: 100, date: '2026-10-22' }],
    badges: [],
  },
  {
    id: 'usr-rahul',
    name: 'Rahul Verma',
    email: 'rahul.verma@eng.edu',
    role: 'student',
    cgpa: 9.1,
    areaOfInterest: 'Backend Developer',
    college: 'BITS Pilani',
    graduationYear: 2026,
    points: 1820,
    rank: 2,
    weeklyActivity: [
      { day: 'Mon', studyHours: 4, score: 250 },
      { day: 'Tue', studyHours: 5, score: 300 },
      { day: 'Wed', studyHours: 4, score: 220 },
      { day: 'Thu', studyHours: 5.5, score: 340 },
      { day: 'Fri', studyHours: 3.5, score: 210 },
      { day: 'Sat', studyHours: 6, score: 390 },
      { day: 'Sun', studyHours: 4, score: 270 },
    ],
    completedCourseIds: ['course-be'],
    completedTaskIds: ['task-1', 'task-3'],
    assessmentScores: [{ assessmentId: 'asmt-be', subjectTitle: 'Backend Systems & Database Architecture', score: 38, maxScore: 40, percentage: 95, date: '2026-10-24' }],
    badges: [],
  },
  {
    id: 'usr-ananya',
    name: 'Ananya Sen',
    email: 'ananya.sen@univ.edu',
    role: 'student',
    cgpa: 8.9,
    areaOfInterest: 'Software Developer',
    college: 'IIIT Hyderabad',
    graduationYear: 2026,
    points: 1650,
    rank: 3,
    weeklyActivity: [
      { day: 'Mon', studyHours: 3.8, score: 210 },
      { day: 'Tue', studyHours: 4.5, score: 270 },
      { day: 'Wed', studyHours: 4.0, score: 230 },
      { day: 'Thu', studyHours: 4.2, score: 250 },
      { day: 'Fri', studyHours: 3.2, score: 180 },
      { day: 'Sat', studyHours: 5.8, score: 360 },
      { day: 'Sun', studyHours: 3.5, score: 210 },
    ],
    completedCourseIds: ['course-fe', 'course-be'],
    completedTaskIds: ['task-2'],
    assessmentScores: [{ assessmentId: 'asmt-dsa', subjectTitle: 'Data Structures & Algorithms', score: 35, maxScore: 40, percentage: 87.5, date: '2026-10-26' }],
    badges: [],
  },
  currentUser,
  {
    id: 'usr-kevin',
    name: 'Kevin Chen',
    email: 'kevin.chen@poly.edu',
    role: 'student',
    cgpa: 8.6,
    areaOfInterest: 'Frontend Developer',
    college: 'State Technical University',
    graduationYear: 2027,
    points: 1290,
    rank: 5,
    weeklyActivity: [
      { day: 'Mon', studyHours: 3, score: 150 },
      { day: 'Tue', studyHours: 3.5, score: 190 },
      { day: 'Wed', studyHours: 2.5, score: 130 },
      { day: 'Thu', studyHours: 4, score: 220 },
      { day: 'Fri', studyHours: 2.8, score: 150 },
      { day: 'Sat', studyHours: 5, score: 310 },
      { day: 'Sun', studyHours: 3, score: 180 },
    ],
    completedCourseIds: [],
    completedTaskIds: ['task-1'],
    assessmentScores: [{ assessmentId: 'asmt-fe', subjectTitle: 'Frontend Architecture & Modern Web', score: 32, maxScore: 40, percentage: 80, date: '2026-10-20' }],
    badges: [],
  },
  {
    id: 'usr-david',
    name: 'David Miller',
    email: 'david.miller@inst.edu',
    role: 'student',
    cgpa: 8.4,
    areaOfInterest: 'DevOps & Cloud',
    college: 'Western Tech Academy',
    graduationYear: 2026,
    points: 1140,
    rank: 6,
    weeklyActivity: [
      { day: 'Mon', studyHours: 2.5, score: 140 },
      { day: 'Tue', studyHours: 3, score: 170 },
      { day: 'Wed', studyHours: 2, score: 110 },
      { day: 'Thu', studyHours: 3.5, score: 200 },
      { day: 'Fri', studyHours: 2.5, score: 130 },
      { day: 'Sat', studyHours: 4.5, score: 260 },
      { day: 'Sun', studyHours: 2.5, score: 150 },
    ],
    completedCourseIds: [],
    completedTaskIds: ['task-4'],
    assessmentScores: [{ assessmentId: 'asmt-cloud', subjectTitle: 'Cloud Infrastructure & DevOps', score: 30, maxScore: 40, percentage: 75, date: '2026-10-18' }],
    badges: [],
  },
];

// Tasks
const tasks: CareerTask[] = [
  {
    id: 'task-1',
    title: 'Implement OAuth 2.0 PKCE & Refresh Tokens in Express',
    track: 'Backend Developer',
    difficulty: 'Intermediate',
    points: 120,
    description: 'Construct a secure session exchange with JWT short-lived access tokens and httpOnly rotating refresh cookies.',
    deliverable: 'GitHub repository link with passing automated test suite.',
    estimatedHours: 4,
  },
  {
    id: 'task-2',
    title: 'Build a Zero-Layout-Shift Responsive Dashboard with Profiler',
    track: 'Frontend Developer',
    difficulty: 'Intermediate',
    points: 100,
    description: 'Create a high-density analytics dashboard using React 19, Tailwind CSS, memoized chart widgets, and zero cumulative layout shift (CLS < 0.05).',
    deliverable: 'Live web deployment and Lighthouse audit score > 95.',
    estimatedHours: 3,
  },
  {
    id: 'task-3',
    title: 'Design Normalized 3NF Schema & Analyze Query Execution Plans',
    track: 'Backend Developer',
    difficulty: 'Advanced',
    points: 150,
    description: 'Design an e-commerce schema with order processing. Run EXPLAIN (ANALYZE, BUFFERS) to demonstrate index scan reduction from seq scans.',
    deliverable: 'SQL schema DDL script and query execution comparison report.',
    estimatedHours: 5,
  },
  {
    id: 'task-4',
    title: 'Containerize Multi-tier Service with Docker Multi-Stage Build',
    track: 'DevOps & Cloud',
    difficulty: 'Beginner',
    points: 90,
    description: 'Write an optimized Dockerfile using builder and distroless runtime stages, decreasing image size from 1.2GB to < 85MB.',
    deliverable: 'Dockerfile and Docker Compose configuration tested locally.',
    estimatedHours: 2,
  },
  {
    id: 'task-5',
    title: 'Build Vector Search Pipeline with Embeddings & Similarity Metric',
    track: 'AI / ML Engineer',
    difficulty: 'Advanced',
    points: 180,
    description: 'Construct an embedding pipeline that indexes technical documentation and answers student queries via cosine similarity ranking.',
    deliverable: 'Jupyter notebook / Node.js script demonstration with retrieval benchmarks.',
    estimatedHours: 6,
  },
];

// Courses
const courses: Course[] = [
  {
    id: 'course-fe',
    code: 'FE-101',
    title: 'Frontend Engineering Mastery & Architecture',
    track: 'Frontend Developer',
    instructor: 'Dr. Aris Thorne',
    instructorRole: 'Staff Frontend Architect, Ex-Vercel',
    duration: '4 Weeks (24 Hours)',
    level: 'Intermediate to Advanced',
    description: 'Master production-grade React architecture, concurrent rendering, state machines, micro-frontends, and Core Web Vitals optimization.',
    imageKey: 'course_frontend_mastery_1793426261105.jpg',
    modules: [
      {
        id: 'mod-fe-1',
        title: 'Module 1: React 19 Compiler, Actions & State Mechanics',
        duration: '5 Hours',
        summary: 'Explore how React 19 auto-memoizes component subtrees and simplifies async mutations with useActionState and optimistic updates.',
        keyConcepts: ['Automatic Memoization', 'useActionState & useOptimistic', 'Concurrent Transition Scheduling', 'Server vs Client Component Boundaries'],
        practicalChallenge: 'Refactor a standard debounce search input into a transition-driven predictive search box with zero lag.',
      },
      {
        id: 'mod-fe-2',
        title: 'Module 2: Advanced Browser Compositing & Rendering Pipelines',
        duration: '6 Hours',
        summary: 'Deep dive into browser paint layers, layout recalculation triggers, CSS containment, and Web Worker thread offloading.',
        keyConcepts: ['Layout vs Paint vs Composite Cost', 'CSS will-change & contain: layout', 'Web Workers for Heavy Computations', 'LCP & CLS Optimization'],
        practicalChallenge: 'Optimize a 10,000-row virtualized list to scroll at a stable 60 FPS without frame drops.',
      },
      {
        id: 'mod-fe-3',
        title: 'Module 3: Enterprise Design Systems & State Machines',
        duration: '7 Hours',
        summary: 'Architect reusable component primitives using Tailwind CSS, headless accessibility patterns, and XState for complex multi-step workflows.',
        keyConcepts: ['Headless Component Primitives', 'WCAG 2.1 AA Compliance', 'Finite State Automata in UI', 'Design Token Versioning'],
        practicalChallenge: 'Construct an accessible multi-step form wizard with undo/redo capabilities driven by a state machine.',
      },
      {
        id: 'mod-fe-4',
        title: 'Module 4: Production Deployment & Real User Monitoring (RUM)',
        duration: '6 Hours',
        summary: 'Implement edge routing, CDN asset caching, automated Lighthouse CI checks, and telemetry probers.',
        keyConcepts: ['Edge Middleware & CDN Caching', 'Synthetic vs RUM Performance Metrics', 'Error Boundaries & Telemetry', 'Production Bundling & Tree Shaking'],
        practicalChallenge: 'Deploy your capstone frontend application with automated bundle size regression gates.',
      },
    ],
    skillsGained: ['React 19 Architecture', 'Performance Profiling', 'Tailwind CSS Systems', 'State Machines', 'Accessibility (ARIA)', 'Core Web Vitals'],
  },
  {
    id: 'course-be',
    code: 'BE-201',
    title: 'Distributed Backend & Cloud Systems',
    track: 'Backend Developer',
    instructor: 'Prof. Neha Gupta',
    instructorRole: 'Professor of Distributed Systems & Database Lead',
    duration: '5 Weeks (30 Hours)',
    level: 'Advanced',
    description: 'Architect resilient backend services with PostgreSQL indexing, Redis caching, event streaming, and fault-tolerant microservices.',
    imageKey: 'course_backend_systems_1793426261424.jpg',
    modules: [
      {
        id: 'mod-be-1',
        title: 'Module 1: Relational Data Modeling & Indexing Internals',
        duration: '8 Hours',
        summary: 'Understand database storage engines, Write-Ahead Logging (WAL), MVCC concurrency control, and B-Tree versus GiST/GIN indexes.',
        keyConcepts: ['3NF Normalization vs Denormalization', 'B-Tree Index Scans vs Seq Scans', 'PostgreSQL MVCC & VACUUM', 'Connection Pooling with PgBouncer'],
        practicalChallenge: 'Optimize complex analytical queries by designing compound and partial indexes in PostgreSQL.',
      },
      {
        id: 'mod-be-2',
        title: 'Module 2: High-Throughput Caching & Distributed Locks',
        duration: '7 Hours',
        summary: 'Implement caching strategies (Cache-Aside, Write-Through) with Redis, mitigate cache stampedes with Redlock, and manage TTL invalidations.',
        keyConcepts: ['Cache Stampede / Thundering Herd', 'Distributed Mutex Locks (Redlock)', 'Redis Data Structures (HyperLogLog, Sorted Sets)', 'Cache Eviction Policies'],
        practicalChallenge: 'Build a distributed rate-limiter using Redis sliding window algorithms capable of handling 50,000 req/sec.',
      },
      {
        id: 'mod-be-3',
        title: 'Module 3: Message Queues & Event-Driven Architecture',
        duration: '8 Hours',
        summary: 'Decouple synchronous requests using asynchronous message brokers (RabbitMQ / Kafka) with idempotency and dead-letter queues.',
        keyConcepts: ['Publish-Subscribe Pattern', 'At-least-once Delivery & Idempotency Keys', 'Dead Letter Exchanges & Backpressure', 'Saga Pattern for Distributed Transactions'],
        practicalChallenge: 'Design an order fulfillment service with guaranteed idempotent message processing.',
      },
      {
        id: 'mod-be-4',
        title: 'Module 4: Zero-Trust Security & API Gateway Infrastructure',
        duration: '7 Hours',
        summary: 'Harden microservice perimeters with mTLS, OAuth 2.0 PKCE, role-based access control (RBAC), and automated penetration defenses.',
        keyConcepts: ['OAuth 2.0 & OpenID Connect', 'Mutual TLS (mTLS) Service Communication', 'Cryptographic Token Rotation', 'CORS, CSP, and Security Headers'],
        practicalChallenge: 'Implement an API gateway that validates JWT signatures and injects downstream tenant context.',
      },
    ],
    skillsGained: ['PostgreSQL & Query Tuning', 'Redis Distributed Systems', 'Message Queues', 'REST & gRPC Design', 'Docker & Containerization', 'API Security'],
  },
  {
    id: 'course-ai',
    code: 'AI-301',
    title: 'Applied AI & Machine Learning Engineering',
    track: 'AI / ML Engineer',
    instructor: 'Dr. Siddharth Rao',
    instructorRole: 'Principal AI Researcher & Gemini Systems Fellow',
    duration: '4 Weeks (28 Hours)',
    level: 'Advanced',
    description: 'Bridge research models into production applications. Build production RAG pipelines, fine-tune adapters, and master LLM orchestration.',
    imageKey: 'course_ai_engineering_1793426262278.jpg',
    modules: [
      {
        id: 'mod-ai-1',
        title: 'Module 1: Vector Embeddings & Similarity Search Engines',
        duration: '7 Hours',
        summary: 'Learn mathematical foundations of high-dimensional vector spaces, quantization, and cosine vs dot-product similarity metrics.',
        keyConcepts: ['Dense vs Sparse Embeddings', 'HNSW & IVFFlat Indexing Algorithms', 'Vector Database Benchmarking', 'Semantic Chunking Strategies'],
        practicalChallenge: 'Index 5,000 research articles into a vector database and build a semantic similarity search engine.',
      },
      {
        id: 'mod-ai-2',
        title: 'Module 2: Production Retrieval-Augmented Generation (RAG)',
        duration: '8 Hours',
        summary: 'Architect end-to-end RAG workflows with re-ranking (cross-encoders), context compression, and automated hallucination detection.',
        keyConcepts: ['Two-Stage Retrieval with Cross-Encoders', 'Prompt Grounding & Guardrails', 'Query Expansion (HyDE)', 'RAG Triad Evaluation Metrics'],
        practicalChallenge: 'Build a production RAG application grounded on legal or academic PDFs with verifiable citation links.',
      },
      {
        id: 'mod-ai-3',
        title: 'Module 3: LLM Orchestration with Gemini 3.8 Flash',
        duration: '7 Hours',
        summary: 'Harness the @google/genai SDK for function calling, structured JSON output validation, multi-turn stateful dialogues, and streaming.',
        keyConcepts: ['Structured Schema Output Enforcement', 'Function Calling & Tool Grounding', 'Context Window Economics', 'Reasoning Thinking Levels'],
        practicalChallenge: 'Create an autonomous career mentor agent that executes multi-step job analysis tools via Gemini API.',
      },
      {
        id: 'mod-ai-4',
        title: 'Module 4: Model Evaluation, Guardrails & ML Observability',
        duration: '6 Hours',
        summary: 'Monitor model drift, latency percentiles (p95, p99), prompt injection protection, and automated regression benchmarks.',
        keyConcepts: ['Prompt Injection Defense', 'Latency & Token Budget Optimization', 'Automated LLM Evaluation Pipelines', 'A/B Testing AI Features'],
        practicalChallenge: 'Build an observability dashboard tracking token usage, hallucination scores, and user satisfaction signals.',
      },
    ],
    skillsGained: ['Vector Databases & Embeddings', 'RAG Architecture', '@google/genai SDK', 'Prompt Engineering', 'Model Evaluation', 'AI Security & Guardrails'],
  },
];

// Teacher feedback initial data
let teacherFeedbacks: TeacherFeedback[] = [
  {
    id: 'fb-1',
    studentId: 'usr-student-aarav',
    studentName: 'Aarav Sharma',
    teacherName: 'Prof. Neha Gupta',
    teacherRole: 'Head of Department (Computer Science & Engineering)',
    subject: 'Core Web Architecture & Algorithm Proficiency',
    date: '2026-10-27',
    ratings: {
      technicalAcumen: 9,
      problemSolving: 8,
      projectDiscipline: 9,
      consistency: 9,
    },
    keyStrengths: [
      'Strong grasp of React rendering cycles and DOM optimization',
      'Consistent daily commitment to algorithmic practice (30+ hours weekly)',
      'Clean Git commit hygiene with descriptive pull request documentation',
    ],
    areasOfImprovement: [
      'Deepen understanding of distributed database sharding and CAP theorem trade-offs',
      'Increase participation in open-source discussions on peer repository reviews',
    ],
    mentorVerdict: 'Aarav is performing in the top 5% of frontend engineering candidates. His high CGPA (8.8) paired with solid practical deliverables makes him an exceptional candidate for top-tier software engineering internships.',
    actionablePlan: 'Complete the Distributed Backend assessment by next week to broaden system design horizons, and prepare a presentation on Web Vitals for the campus developer symposium.',
  },
  {
    id: 'fb-2',
    studentId: 'usr-student-aarav',
    studentName: 'Aarav Sharma',
    teacherName: 'Dr. Aris Thorne',
    teacherRole: 'Faculty Mentor & Industry Fellow',
    subject: 'Frontend Performance & Production Readiness',
    date: '2026-10-22',
    ratings: {
      technicalAcumen: 9,
      problemSolving: 9,
      projectDiscipline: 8,
      consistency: 9,
    },
    keyStrengths: [
      'Excellent performance in the Frontend Assessment (scored 36/40)',
      'Proactive in helping junior peers debug complex JavaScript closure problems',
    ],
    areasOfImprovement: [
      'Experiment with WebAssembly for computationally heavy browser audio/video tasks',
      'Document system architecture diagrams before coding large components',
    ],
    mentorVerdict: 'Exceptional aptitude for frontend architecture. Aarav demonstrates the precision and aesthetic discipline expected in modern engineering teams.',
    actionablePlan: 'Finish the Frontend Engineering Mastery course capstone and download the verified credential for resume inclusion.',
  },
];

// Peer Messages
let peerMessages: PeerMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-priya',
    senderName: 'Priya Patel',
    senderRole: 'student',
    senderCgpa: 9.5,
    receiverId: 'usr-student-aarav',
    content: 'Hey Aarav! Saw your score on the Frontend assessment, 36/40 is phenomenal! Did you use the official React 19 docs or any specific repo for preparation?',
    timestamp: '2026-10-29T14:22:00Z',
  },
  {
    id: 'msg-2',
    senderId: 'usr-student-aarav',
    senderName: 'Aarav Sharma',
    senderRole: 'student',
    senderCgpa: 8.8,
    receiverId: 'usr-priya',
    content: 'Thanks Priya! Mostly the React deep-dive notes from the platform resources and building small prototypes for useActionState. Congrats on your #1 rank on the leaderboard by the way!',
    timestamp: '2026-10-29T14:25:30Z',
  },
  {
    id: 'msg-3',
    senderId: 'usr-priya',
    senderName: 'Priya Patel',
    senderRole: 'student',
    senderCgpa: 9.5,
    receiverId: 'usr-student-aarav',
    content: 'Thank you! If you ever want to team up on the Vector Search pipeline task, let me know. We could build something really cool together.',
    timestamp: '2026-10-29T14:28:10Z',
  },
  {
    id: 'msg-4',
    senderId: 'usr-rahul',
    senderName: 'Rahul Verma',
    senderRole: 'student',
    senderCgpa: 9.1,
    receiverId: 'usr-student-aarav',
    content: 'Aarav, do you have any quick tips for the QuickSort partition questions in the Algorithms assessment? Got tripped up on the naive pivot scenario.',
    timestamp: '2026-10-28T09:15:00Z',
  },
  {
    id: 'msg-5',
    senderId: 'usr-student-aarav',
    senderName: 'Aarav Sharma',
    senderRole: 'student',
    senderCgpa: 8.8,
    receiverId: 'usr-rahul',
    content: 'Hey Rahul! Check the explanation on question 1: when a naive pivot is picked on already sorted lists, it creates an unbalanced partition (n and 0 elements), degrading to O(n^2). Use randomized or median-of-three pivot!',
    timestamp: '2026-10-28T09:18:40Z',
  },
];

// Shared Resources
let sharedResources: SharedResource[] = [
  {
    id: 'res-1',
    title: 'React 19 & Concurrent Rendering Cheatsheet',
    category: 'Frontend Engineering',
    authorName: 'Aarav Sharma',
    authorRole: 'Student (8.8 CGPA)',
    description: 'Comprehensive 8-page summary covering useTransition, Server Actions, useOptimistic, and memoization rules with practical code patterns.',
    linkUrl: 'https://github.com/career-genius/react19-cheatsheet',
    fileType: 'CheatSheet',
    upvotes: 42,
    date: '2026-10-26',
    userUpvoted: true,
  },
  {
    id: 'res-2',
    title: 'System Design Interview Roadmap (FAANG Ready)',
    category: 'Backend Systems',
    authorName: 'Rahul Verma',
    authorRole: 'Student (9.1 CGPA)',
    description: 'Curated architectural templates for URL shorteners, distributed rate-limiters, notification engines, and cache invalidation strategies.',
    linkUrl: 'https://github.com/career-genius/system-design-roadmap',
    fileType: 'GitHub',
    upvotes: 68,
    date: '2026-10-24',
    userUpvoted: false,
  },
  {
    id: 'res-3',
    title: 'PostgreSQL Index Optimization & Execution Plan Analysis',
    category: 'Databases',
    authorName: 'Prof. Neha Gupta',
    authorRole: 'Faculty Advisor',
    description: 'In-depth laboratory guide demonstrating how to interpret EXPLAIN (ANALYZE, BUFFERS) and design partial and multi-column B-Tree indexes.',
    linkUrl: 'https://campus.edu/resources/postgres-optimization.pdf',
    fileType: 'PDF',
    upvotes: 95,
    date: '2026-10-20',
    userUpvoted: true,
  },
  {
    id: 'res-4',
    title: 'Modern AI & RAG Pipeline Architecture Notes',
    category: 'Machine Learning',
    authorName: 'Priya Patel',
    authorRole: 'Student (9.5 CGPA)',
    description: 'Step-by-step implementation guide for vector search, cosine distance calculations, chunking strategies, and Gemini API structured output.',
    linkUrl: 'https://github.com/career-genius/rag-production-guide',
    fileType: 'Notes',
    upvotes: 83,
    date: '2026-10-28',
    userUpvoted: false,
  },
];

// ==========================================
// REST API Endpoints
// ==========================================

// 1. User & Profile Endpoints
app.get('/api/user', (req: Request, res: Response) => {
  res.json({ success: true, user: currentUser });
});

app.post('/api/user/update-profile', (req: Request, res: Response) => {
  const { name, cgpa, areaOfInterest, college, graduationYear } = req.body;
  
  if (name) currentUser.name = String(name).trim();
  if (typeof cgpa === 'number' && !isNaN(cgpa)) {
    currentUser.cgpa = Math.min(10, Math.max(0, Number(cgpa.toFixed(2))));
  }
  if (areaOfInterest) currentUser.areaOfInterest = String(areaOfInterest).trim();
  if (college) currentUser.college = String(college).trim();
  if (graduationYear) currentUser.graduationYear = Number(graduationYear);

  // Recalculate rank across cohort
  recalculateCohortRanks();

  res.json({ success: true, user: currentUser, message: 'Profile updated successfully.' });
});

app.post('/api/user/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (role === 'student' || role === 'teacher' || role === 'admin') {
    currentUser.role = role;
    if (role === 'teacher') {
      currentUser.name = 'Prof. Neha Gupta';
      currentUser.email = 'neha.gupta@faculty.edu';
    } else if (role === 'admin') {
      currentUser.name = 'Admin Controller';
      currentUser.email = 'admin@careergenius.edu';
    } else {
      currentUser.name = 'Aarav Sharma';
      currentUser.email = 'aarav.sharma@campus.edu';
    }
    return res.json({ success: true, user: currentUser, message: `Switched active role to ${role}` });
  }
  res.status(400).json({ success: false, error: 'Invalid role provided.' });
});

// 2. Assessments & Subjects Endpoints
app.get('/api/subjects', (req: Request, res: Response) => {
  res.json({ success: true, subjects });
});

app.get('/api/assessments', (req: Request, res: Response) => {
  // Return assessments with current questions
  const fullAssessments = assessments.map((asmt) => ({
    ...asmt,
    questions: questions.filter((q) => q.subjectId === asmt.subjectId),
  }));
  res.json({ success: true, assessments: fullAssessments });
});

app.post('/api/assessments/submit', (req: Request, res: Response) => {
  const { assessmentId, answers } = req.body as { assessmentId: string; answers: Record<string, number> };

  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    return res.status(404).json({ success: false, error: 'Assessment not found.' });
  }

  const asmtQuestions = questions.filter((q) => q.subjectId === assessment.subjectId);
  let correctCount = 0;
  const questionResults = asmtQuestions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.question,
      selectedOption: selected !== undefined ? q.options[selected] : 'Not answered',
      correctOption: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = asmtQuestions.length || 1;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const earnedScore = Math.round((correctCount / totalQuestions) * assessment.totalMarks);
  const earnedPoints = Math.round((correctCount / totalQuestions) * 250);

  // Update user score
  const existingIdx = currentUser.assessmentScores.findIndex((s) => s.assessmentId === assessmentId);
  const record = {
    assessmentId,
    subjectTitle: assessment.subjectTitle,
    score: earnedScore,
    maxScore: assessment.totalMarks,
    percentage,
    date: new Date().toISOString().split('T')[0],
  };

  if (existingIdx >= 0) {
    currentUser.assessmentScores[existingIdx] = record;
  } else {
    currentUser.assessmentScores.push(record);
  }

  currentUser.points += earnedPoints;

  // Update today's weekly activity
  const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const dayAct = currentUser.weeklyActivity.find((w) => w.day === todayName);
  if (dayAct) {
    dayAct.score += earnedPoints;
    dayAct.studyHours += 0.5;
  }

  recalculateCohortRanks();

  res.json({
    success: true,
    score: earnedScore,
    maxScore: assessment.totalMarks,
    percentage,
    correctCount,
    totalQuestions,
    earnedPoints,
    newTotalPoints: currentUser.points,
    newRank: currentUser.rank,
    questionResults,
  });
});

// 3. Courses & Certification Endpoints
app.get('/api/courses', (req: Request, res: Response) => {
  res.json({
    success: true,
    courses,
    completedCourseIds: currentUser.completedCourseIds,
  });
});

app.post('/api/courses/complete', (req: Request, res: Response) => {
  const { courseId } = req.body;
  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found.' });
  }

  if (!currentUser.completedCourseIds.includes(courseId)) {
    currentUser.completedCourseIds.push(courseId);
    currentUser.points += 300;
    recalculateCohortRanks();
  }

  res.json({
    success: true,
    message: `Congratulations! You completed ${course.title}`,
    completedCourseIds: currentUser.completedCourseIds,
    earnedPoints: 300,
    newPoints: currentUser.points,
  });
});

// 4. Tasks Endpoints
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json({
    success: true,
    tasks,
    completedTaskIds: currentUser.completedTaskIds,
  });
});

app.post('/api/tasks/toggle', (req: Request, res: Response) => {
  const { taskId } = req.body;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  const isCompleted = currentUser.completedTaskIds.includes(taskId);
  if (isCompleted) {
    currentUser.completedTaskIds = currentUser.completedTaskIds.filter((id) => id !== taskId);
    currentUser.points = Math.max(0, currentUser.points - task.points);
  } else {
    currentUser.completedTaskIds.push(taskId);
    currentUser.points += task.points;
  }

  recalculateCohortRanks();

  res.json({
    success: true,
    completedTaskIds: currentUser.completedTaskIds,
    newPoints: currentUser.points,
    newRank: currentUser.rank,
  });
});

// 5. Leaderboard & Weekly Performance Endpoints
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const track = (req.query.track as string) || 'all';

  // Include all cohort students with recalculated points & ranks
  let list = cohortStudents.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    cgpa: s.cgpa,
    areaOfInterest: s.areaOfInterest,
    college: s.college,
    points: s.points,
    rank: s.rank,
    weeklyActivity: s.weeklyActivity,
    completedCourseCount: s.completedCourseIds.length,
    completedTaskCount: s.completedTaskIds.length,
    assessmentCount: s.assessmentScores.length,
  }));

  if (track !== 'all') {
    list = list.filter((s) => s.areaOfInterest.toLowerCase() === track.toLowerCase());
  }

  list.sort((a, b) => b.points - a.points);
  const ranked = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

  res.json({
    success: true,
    leaderboard: ranked,
    currentUserRank: currentUser.rank,
    currentUserPoints: currentUser.points,
    totalStudents: 1280, // Platform registered students
  });
});

// 6. Teacher Feedback Dashboard Endpoints
app.get('/api/feedback', (req: Request, res: Response) => {
  // If teacher, return feedback for all students; if student, return their personalized feedback
  if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
    return res.json({
      success: true,
      feedback: teacherFeedbacks,
      allStudents: cohortStudents.map((s) => ({
        id: s.id,
        name: s.name,
        cgpa: s.cgpa,
        areaOfInterest: s.areaOfInterest,
        points: s.points,
        assessmentScores: s.assessmentScores,
      })),
    });
  }

  // Student personalized feedback
  const studentFeedbacks = teacherFeedbacks.filter((fb) => fb.studentId === currentUser.id);
  res.json({
    success: true,
    feedback: studentFeedbacks,
  });
});

app.post('/api/feedback', (req: Request, res: Response) => {
  const { studentId, subject, ratings, keyStrengths, areasOfImprovement, mentorVerdict, actionablePlan } = req.body;

  const targetStudent = cohortStudents.find((s) => s.id === studentId);
  if (!targetStudent) {
    return res.status(404).json({ success: false, error: 'Student not found.' });
  }

  const newFeedback: TeacherFeedback = {
    id: `fb-${Date.now()}`,
    studentId: targetStudent.id,
    studentName: targetStudent.name,
    teacherName: currentUser.name || 'Faculty Mentor',
    teacherRole: currentUser.role === 'teacher' ? 'Senior Faculty Advisor' : 'Platform Academic Dean',
    subject: subject || 'Holistic Engineering Performance',
    date: new Date().toISOString().split('T')[0],
    ratings: {
      technicalAcumen: Number(ratings?.technicalAcumen) || 8,
      problemSolving: Number(ratings?.problemSolving) || 8,
      projectDiscipline: Number(ratings?.projectDiscipline) || 8,
      consistency: Number(ratings?.consistency) || 8,
    },
    keyStrengths: Array.isArray(keyStrengths) ? keyStrengths : [keyStrengths].filter(Boolean),
    areasOfImprovement: Array.isArray(areasOfImprovement) ? areasOfImprovement : [areasOfImprovement].filter(Boolean),
    mentorVerdict: mentorVerdict || 'Demonstrating consistent progress across core technical assessments.',
    actionablePlan: actionablePlan || 'Focus on completing scheduled course capstone milestones.',
  };

  teacherFeedbacks.unshift(newFeedback);
  res.json({ success: true, feedback: newFeedback, message: 'Teacher feedback recorded successfully.' });
});

// 7. Peer-to-Peer Messaging Endpoints
app.get('/api/messages', (req: Request, res: Response) => {
  const otherUserId = (req.query.peerId as string) || '';

  // Return peers list with recent chat snippet
  const peers = cohortStudents
    .filter((s) => s.id !== currentUser.id)
    .map((peer) => {
      const thread = peerMessages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === peer.id) ||
          (m.senderId === peer.id && m.receiverId === currentUser.id)
      );
      const lastMsg = thread[thread.length - 1];
      return {
        id: peer.id,
        name: peer.name,
        cgpa: peer.cgpa,
        areaOfInterest: peer.areaOfInterest,
        college: peer.college,
        lastMessage: lastMsg ? lastMsg.content : 'Start a career discussion...',
        lastTimestamp: lastMsg ? lastMsg.timestamp : null,
      };
    });

  let activeThread: PeerMessage[] = [];
  if (otherUserId) {
    activeThread = peerMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUser.id)
    );
  } else if (peers.length > 0) {
    const defaultPeer = peers[0];
    activeThread = peerMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === defaultPeer.id) ||
        (m.senderId === defaultPeer.id && m.receiverId === currentUser.id)
    );
  }

  res.json({
    success: true,
    peers,
    activeThread,
  });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content || !String(content).trim()) {
    return res.status(400).json({ success: false, error: 'Recipient and message content are required.' });
  }

  const targetPeer = cohortStudents.find((s) => s.id === receiverId);
  if (!targetPeer) {
    return res.status(404).json({ success: false, error: 'Peer user not found.' });
  }

  const newMsg: PeerMessage = {
    id: `msg-${Date.now()}`,
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderRole: currentUser.role,
    senderCgpa: currentUser.cgpa,
    receiverId,
    content: String(content).trim(),
    timestamp: new Date().toISOString(),
  };

  peerMessages.push(newMsg);

  res.json({ success: true, message: newMsg });
});

// 8. Shared Resources Endpoints
app.get('/api/resources', (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'all';
  const bookmarkedOnly = req.query.bookmarked === 'true';
  const userBookmarks = currentUser.bookmarkedResourceIds || [];

  let list = sharedResources.map((r) => ({
    ...r,
    isBookmarked: userBookmarks.includes(r.id),
  }));

  if (bookmarkedOnly) {
    list = list.filter((r) => r.isBookmarked);
  }

  if (category !== 'all') {
    list = list.filter((r) => r.category.toLowerCase().includes(category.toLowerCase()));
  }

  res.json({ success: true, resources: list });
});

app.post('/api/resources', (req: Request, res: Response) => {
  const { title, category, description, linkUrl, fileType } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required.' });
  }

  const newRes: SharedResource = {
    id: `res-${Date.now()}`,
    title: String(title).trim(),
    category: category || 'General Tech',
    authorName: currentUser.name,
    authorRole: currentUser.role === 'student' ? `Student (${currentUser.cgpa} CGPA)` : 'Faculty Advisor',
    description: String(description).trim(),
    linkUrl: linkUrl || 'https://github.com/career-genius/community-resources',
    fileType: fileType || 'Notes',
    upvotes: 1,
    date: new Date().toISOString().split('T')[0],
    userUpvoted: true,
    isBookmarked: false,
  };

  sharedResources.unshift(newRes);
  currentUser.points += 50; // Points for community sharing
  recalculateCohortRanks();

  res.json({ success: true, resource: newRes, message: 'Resource shared successfully! +50 Community Points' });
});

app.post('/api/resources/:id/upvote', (req: Request, res: Response) => {
  const resItem = sharedResources.find((r) => r.id === req.params.id);
  if (!resItem) {
    return res.status(404).json({ success: false, error: 'Resource not found.' });
  }

  if (resItem.userUpvoted) {
    resItem.upvotes = Math.max(0, resItem.upvotes - 1);
    resItem.userUpvoted = false;
  } else {
    resItem.upvotes += 1;
    resItem.userUpvoted = true;
  }

  res.json({ success: true, upvotes: resItem.upvotes, userUpvoted: resItem.userUpvoted });
});

app.post('/api/resources/:id/bookmark', (req: Request, res: Response) => {
  const resItem = sharedResources.find((r) => r.id === req.params.id);
  if (!resItem) {
    return res.status(404).json({ success: false, error: 'Resource not found.' });
  }

  if (!currentUser.bookmarkedResourceIds) {
    currentUser.bookmarkedResourceIds = [];
  }

  const isCurrentlyBookmarked = currentUser.bookmarkedResourceIds.includes(req.params.id);
  if (isCurrentlyBookmarked) {
    currentUser.bookmarkedResourceIds = currentUser.bookmarkedResourceIds.filter((id: string) => id !== req.params.id);
  } else {
    currentUser.bookmarkedResourceIds.push(req.params.id);
  }

  res.json({
    success: true,
    isBookmarked: !isCurrentlyBookmarked,
    bookmarkedResourceIds: currentUser.bookmarkedResourceIds,
    message: !isCurrentlyBookmarked ? 'Resource bookmarked to your saved collection.' : 'Resource removed from saved bookmarks.',
  });
});

// 9. Admin Endpoints: Add Questions, Subjects, Assessments
app.post('/api/admin/questions', (req: Request, res: Response) => {
  const { subjectId, question, options, correctIndex, explanation, difficulty } = req.body;

  if (!subjectId || !question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, error: 'Subject ID, question text, and at least 2 options are required.' });
  }

  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return res.status(404).json({ success: false, error: 'Subject not found.' });
  }

  const newQuestion: Question = {
    id: `q-custom-${Date.now()}`,
    subjectId,
    question: String(question).trim(),
    options: options.map((o: string) => String(o).trim()),
    correctIndex: Number(correctIndex) || 0,
    explanation: String(explanation || 'Standard domain concept verified.').trim(),
    difficulty: difficulty || 'Intermediate',
  };

  questions.push(newQuestion);
  subject.questionCount += 1;

  // Update corresponding assessment
  const asmt = assessments.find((a) => a.subjectId === subjectId);
  if (asmt) {
    asmt.questions = questions.filter((q) => q.subjectId === subjectId);
    asmt.totalMarks = asmt.questions.length * 10;
  }

  res.json({
    success: true,
    question: newQuestion,
    message: `Question successfully added to "${subject.title}"!`,
  });
});

app.post('/api/admin/subjects', (req: Request, res: Response) => {
  const { title, description, iconName } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Subject title is required.' });
  }

  const newSubj: Subject = {
    id: `subj-${Date.now()}`,
    title: String(title).trim(),
    description: String(description || 'Comprehensive foundational subject track.').trim(),
    iconName: iconName || 'BookOpen',
    questionCount: 0,
  };

  subjects.push(newSubj);

  // Automatically create a corresponding assessment for this new subject
  const newAsmt: Assessment = {
    id: `asmt-${Date.now()}`,
    title: `${newSubj.title} Assessment`,
    subjectId: newSubj.id,
    subjectTitle: newSubj.title,
    durationMinutes: 20,
    difficulty: 'Intermediate',
    description: `Validate your domain skills in ${newSubj.title}.`,
    totalMarks: 0,
    questions: [],
  };

  assessments.push(newAsmt);

  res.json({ success: true, subject: newSubj, assessment: newAsmt, message: 'Subject created successfully.' });
});

app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const avgCgpa = (cohortStudents.reduce((sum, s) => sum + s.cgpa, 0) / cohortStudents.length).toFixed(2);
  const totalQuestions = questions.length;
  const totalSubjects = subjects.length;
  const totalAssessments = assessments.length;

  res.json({
    success: true,
    analytics: {
      registeredStudents: 1280,
      activeCohortCount: cohortStudents.length,
      averageCgpa: Number(avgCgpa),
      totalQuestions,
      totalSubjects,
      totalAssessments,
      totalSharedResources: sharedResources.length,
      totalFeedbackLogs: teacherFeedbacks.length,
    },
  });
});

// 10. AI Career Guidance Assistant (Gemini 3.8 Flash)
app.post('/api/ai/career-advice', async (req: Request, res: Response) => {
  const { query, studentContext } = req.body;

  const promptQuery = query || 'What should be my 30-day roadmap based on my CGPA and target domain?';
  const cgpa = studentContext?.cgpa ?? currentUser.cgpa;
  const area = studentContext?.areaOfInterest ?? currentUser.areaOfInterest;
  const recentScores = currentUser.assessmentScores
    .map((s) => `${s.subjectTitle}: ${s.score}/${s.maxScore} (${s.percentage}%)`)
    .join(', ');

  const systemPrompt = `You are Career Genius AI, an elite university career mentor and technical hiring expert.
The student has:
- Current CGPA: ${cgpa} / 10.0
- Target Role / Area of Interest: ${area}
- Assessments completed: ${recentScores || 'None yet'}
- Completed Tasks: ${currentUser.completedTaskIds.length} tasks

Provide a structured, highly actionable, concise response with:
1. Executive Career Assessment (Honest appraisal of their CGPA and role alignment)
2. Immediate 30-Day Technical Action Plan (3-4 high-impact milestones)
3. Essential Resume Projects to Stand Out (2 production-grade project ideas)
4. Interview Preparation Tips & Common Pitfalls to Avoid
Keep the tone encouraging, pragmatic, professional, and free of generic AI fluff.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${promptQuery}\n\nPlease analyze based on my student profile.`,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({
        success: true,
        advice: response.text,
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (err: unknown) {
      console.error('Gemini API call failed, falling back to expert curated career advisor:', err);
    }
  }

  // Fallback intelligent curated guidance if API key is not configured or in offline sandbox
  const fallbackAdvice = `### Executive Career Assessment for ${area}
With a strong CGPA of **${cgpa} / 10.0**, you possess the academic benchmark required by Tier-1 product companies and high-growth engineering teams. Your primary differentiator will be demonstrable production experience, system design mastery, and clean code hygiene.

---

### Immediate 30-Day Action Plan
1. **Week 1: Core Fundamentals & Test Benchmarks**
   - Solidify your foundation in ${area}. Target scoring 85%+ on the Career Genius domain assessment.
   - Master data structures (Trees, Hash Tables, Dynamic Programming) with 2 problems daily.
2. **Week 2-3: Capstone Production Build**
   - Build a real full-stack project with zero layout shifts, end-to-end type safety, and automated CI tests.
   - Implement authentication (OAuth 2.0 PKCE) and database indexing with measurable query benchmarks.
3. **Week 4: Mock Technical Interviews & Peer Reviews**
   - Utilize Career Genius peer messaging to conduct 2 mock technical interviews.
   - Review your teacher feedback report and implement faculty recommendations.

---

### High-Impact Project Ideas for ${area}
- **Production Event-Driven Platform**: A distributed service with Redis caching, PostgreSQL transaction guarantees, and WebSockets.
- **Developer Observability / Tooling**: A zero-configuration bundle analyzer or accessibility linter with interactive CLI.

---

### Technical Interview Tips
- **Always clarify requirements**: Ask about scale (requests per second), data consistency requirements, and latency targets before writing architecture.
- **Code defensively**: Handle edge cases (empty inputs, network timeouts, invalid auth states) explicitly in live coding rounds.`;

  return res.json({
    success: true,
    advice: fallbackAdvice,
    modelUsed: 'curated-expert-engine',
  });
});

// Helper: Recalculate ranks and award visual achievement badges across cohort
function recalculateCohortRanks() {
  cohortStudents.sort((a, b) => b.points - a.points);
  cohortStudents.forEach((student, index) => {
    student.rank = index + 1;
    student.badges = evaluateStudentBadges({
      rank: student.rank,
      totalStudents: 1280,
      cgpa: student.cgpa,
      completedCourseIds: student.completedCourseIds,
      completedTaskIds: student.completedTaskIds,
      assessmentScores: student.assessmentScores,
      sharedResourcesCount: sharedResources.filter((r) => r.authorName.includes(student.name)).length,
    });
  });

  currentUser.badges = evaluateStudentBadges({
    rank: currentUser.rank,
    totalStudents: 1280,
    cgpa: currentUser.cgpa,
    completedCourseIds: currentUser.completedCourseIds,
    completedTaskIds: currentUser.completedTaskIds,
    assessmentScores: currentUser.assessmentScores,
    sharedResourcesCount: sharedResources.filter((r) => r.authorName.includes(currentUser.name)).length,
  });
}

// Initial evaluation
recalculateCohortRanks();

// ==========================================
// Dev & Production Server Mounting
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, attach Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Genius full-stack platform listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
