export type UserRole = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  accountStatus: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  description: string;
  dean?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  schoolId: string;
  schoolName?: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProgrammeStatus = 'Draft' | 'Review' | 'Approved' | 'Published' | 'Archived';
export type ProgrammeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Programme {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName?: string;
  description: string;
  learningHours: number;
  difficulty: ProgrammeDifficulty;
  objectives: string;
  learningOutcomes: string;
  entryRequirements: string;
  completionRequirements: string;
  minimumScore: number; // e.g. 70 (%)
  imageUrl?: string;
  status: ProgrammeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Course {
  id: string;
  programmeId: string;
  title: string;
  description: string;
  outcomes: string;
  learningMinutes: number;
  difficulty: ProgrammeDifficulty;
  category: string;
  entryRequirements?: string;
  courseOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  programmeId: string;
  courseId: string;
  title: string;
  description: string;
  objectives: string;
  estimatedMinutes: number;
  moduleOrder: number;
  learnerSupportGuidance?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'Reading'
  | 'Video'
  | 'Audio'
  | 'Interactive activity'
  | 'Assignment'
  | 'Quiz';

export interface Lesson {
  id: string;
  programmeId: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  objectives: string;
  activityType: ActivityType;
  estimatedMinutes: number;
  points: number;
  isRequired: boolean;
  lessonOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
}

export interface LearningContent {
  id: string;
  programmeId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  sections: {
    introduction: string;
    learningObjectives: string;
    prerequisites: string;
    mainContent: string;
    keyConcepts: string;
    examples: string;
    practicalApplication: string;
    caseStudy: string;
    activity: string;
    selfCheck: string;
    keyTakeaways: string;
    glossary: string;
    conclusion: string;
    furtherReading: string;
  };
  wordCount: number;
  readingTime: number; // minutes
  isDraft: boolean;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  programmeId: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'Images' | 'Audio' | 'Video';
  fileUrl: string;
  storagePath: string;
  size: number; // bytes
  isProtected: boolean;
  createdAt: string;
}

export type AssessmentType = 'Quiz' | 'Assignment' | 'Examination' | 'Practical assessment';

export interface Assessment {
  id: string;
  programmeId: string;
  courseId: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  assessmentType: AssessmentType;
  passingScore: number; // in percentage e.g. 70
  totalPoints: number;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  assessmentWeight: number; // percentage of programme grade
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'long_answer';
export type QuestionStatus = 'Draft' | 'Review' | 'Approved';

export interface QuestionBankItem {
  id: string;
  bankId?: string;
  questionText: string;
  questionType: QuestionType;
  options: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: ProgrammeDifficulty;
  category: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  progressPercentage: number;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  programmeId: string;
  completedLessons: string[]; // lesson IDs
  completedModules: string[]; // module IDs
  completedCourses: string[]; // course IDs
  assessmentScores: Record<string, number>; // assessmentId -> score percentage
  finalScore: number;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt?: string | null;
  updatedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  programmeId: string;
  answers: Record<string, string>;
  score: number; // percentage
  totalPoints: number;
  passed: boolean;
  attemptNumber: number;
  completedAt: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  issueDate: string;
  founderSignature: string; // "akinssokpah"
  status: 'Valid' | 'Revoked';
  qrCodeDataUrl: string;
  metadata?: {
    totalHours: number;
    finalScore: number;
    completionDate: string;
  };
  createdAt: string;
}

export interface TranscriptCourseEntry {
  courseId: string;
  courseTitle: string;
  learningHours: number;
  status: 'Completed' | 'In Progress';
  score: number;
  completionDate?: string;
}

export interface Transcript {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  courses: TranscriptCourseEntry[];
  finalResult: 'Distinction' | 'Merit' | 'Pass' | 'In Progress';
  issueDate: string;
  gpaOrAverage: number;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRecord {
  id: string;
  certificateId: string;
  certificateNumber: string;
  verificationCode: string;
  studentName: string;
  programmeName: string;
  programmeCode: string;
  issueDate: string;
  status: 'Valid' | 'Revoked' | 'Not Found';
  verifiedCount: number;
  lastVerifiedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  recordType: string;
  recordId: string;
  details?: string;
  timestamp: string;
}
