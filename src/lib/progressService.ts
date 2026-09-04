import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Enrollment,
  StudentProgress,
  AssessmentAttempt,
  Programme,
  Lesson,
  Assessment,
  QuestionBankItem,
} from '../types';
import { automaticallyIssueCertificate } from './certificateService';
import { fetchCourses, fetchLessons } from './academicService';

export async function enrollStudent(
  studentId: string,
  studentEmail: string,
  studentName: string,
  programme: Programme
): Promise<Enrollment> {
  try {
    // Check if already enrolled
    const qRef = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('programmeId', '==', programme.id)
    );
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as Enrollment;
    }

    const enrollDoc = doc(collection(db, 'enrollments'));
    const now = new Date().toISOString();

    const enrollment: Enrollment = {
      id: enrollDoc.id,
      studentId,
      studentEmail,
      studentName,
      programmeId: programme.id,
      programmeName: programme.name,
      programmeCode: programme.code,
      enrolledAt: now,
      status: 'active',
      progressPercentage: 0,
    };
    await setDoc(enrollDoc, enrollment);

    // Initial studentProgress record
    const progressDocId = `${studentId}_${programme.id}`;
    const progressDoc = doc(db, 'studentProgress', progressDocId);
    const progressSnap = await getDoc(progressDoc);

    if (!progressSnap.exists()) {
      const initialProgress: StudentProgress = {
        id: progressDocId,
        studentId,
        programmeId: programme.id,
        completedLessons: [],
        completedModules: [],
        completedCourses: [],
        assessmentScores: {},
        finalScore: 0,
        completionPercentage: 0,
        isCompleted: false,
        completedAt: null,
        updatedAt: now,
      };
      await setDoc(progressDoc, initialProgress);
    }

    return enrollment;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'enrollments');
  }
}

export async function fetchStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  try {
    const qRef = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Enrollment[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'enrollments');
  }
}

export async function fetchAllEnrollments(): Promise<Enrollment[]> {
  try {
    const snap = await getDocs(collection(db, 'enrollments'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Enrollment[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'enrollments');
  }
}

export async function fetchStudentProgress(studentId: string, programmeId: string): Promise<StudentProgress | null> {
  try {
    const progressDocId = `${studentId}_${programmeId}`;
    const snap = await getDoc(doc(db, 'studentProgress', progressDocId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as StudentProgress;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `studentProgress/${studentId}_${programmeId}`);
  }
}

export async function markLessonComplete(
  studentId: string,
  studentName: string,
  studentEmail: string,
  programme: Programme,
  lessonId: string,
  allRequiredLessons: Lesson[],
  programmeAssessments: Assessment[]
): Promise<StudentProgress> {
  try {
    const progressDocId = `${studentId}_${programme.id}`;
    const progressRef = doc(db, 'studentProgress', progressDocId);
    let progress = await fetchStudentProgress(studentId, programme.id);

    const now = new Date().toISOString();
    if (!progress) {
      progress = {
        id: progressDocId,
        studentId,
        programmeId: programme.id,
        completedLessons: [lessonId],
        completedModules: [],
        completedCourses: [],
        assessmentScores: {},
        finalScore: 0,
        completionPercentage: 0,
        isCompleted: false,
        completedAt: null,
        updatedAt: now,
      };
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons = [...progress.completedLessons, lessonId];
      }
    }

    // Calculate completion metrics
    const totalRequiredCount = Math.max(1, allRequiredLessons.length);
    const completedCount = allRequiredLessons.filter((l) => progress!.completedLessons.includes(l.id)).length;
    const lessonCompletionRate = (completedCount / totalRequiredCount) * 100;

    // Assessment weight
    let assessmentRate = 0;
    if (programmeAssessments.length > 0) {
      const passedAssessments = programmeAssessments.filter(
        (a) => (progress!.assessmentScores[a.id] || 0) >= a.passingScore
      ).length;
      assessmentRate = (passedAssessments / programmeAssessments.length) * 100;
    } else {
      assessmentRate = 100;
    }

    // Overall completion percentage
    const overallPercentage = Math.round(
      programmeAssessments.length > 0
        ? lessonCompletionRate * 0.7 + assessmentRate * 0.3
        : lessonCompletionRate
    );
    progress.completionPercentage = Math.min(100, Math.max(0, overallPercentage));
    progress.updatedAt = now;

    // Check if fully completed
    const allLessonsDone = allRequiredLessons.every((l) => progress!.completedLessons.includes(l.id));
    const allAssessmentsDone =
      programmeAssessments.length === 0 ||
      programmeAssessments.every((a) => (progress!.assessmentScores[a.id] || 0) >= a.passingScore);

    const averageScore = Object.values(progress.assessmentScores).length > 0
      ? Math.round(
          Object.values(progress.assessmentScores).reduce((a, b) => a + b, 0) /
            Object.values(progress.assessmentScores).length
        )
      : 85;

    progress.finalScore = averageScore;

    if (allLessonsDone && allAssessmentsDone && averageScore >= programme.minimumScore && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = now;
      progress.completionPercentage = 100;

      // Update enrollment status
      const enrollQ = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('programmeId', '==', programme.id)
      );
      const enrollSnap = await getDocs(enrollQ);
      if (!enrollSnap.empty) {
        await updateDoc(enrollSnap.docs[0].ref, {
          status: 'completed',
          progressPercentage: 100,
        });
      }

      // Automatically issue Certificate and Transcript
      const courses = await fetchCourses(programme.id);
      await automaticallyIssueCertificate(
        studentId,
        studentName,
        studentEmail,
        programme,
        progress,
        courses
      );
    }

    await setDoc(progressRef, progress, { merge: true });
    return progress;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `studentProgress/${studentId}_${programme.id}`);
  }
}

export async function submitAssessmentAttempt(
  studentId: string,
  studentName: string,
  studentEmail: string,
  programme: Programme,
  assessment: Assessment,
  questions: QuestionBankItem[],
  studentAnswers: Record<string, string>,
  allRequiredLessons: Lesson[],
  programmeAssessments: Assessment[]
): Promise<{ score: number; passed: boolean; totalPoints: number; attempt: AssessmentAttempt }> {
  try {
    let earnedPoints = 0;
    let maxPoints = 0;

    questions.forEach((q) => {
      maxPoints += q.points || 10;
      const studentAns = (studentAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      if (studentAns && studentAns === correctAns) {
        earnedPoints += q.points || 10;
      }
    });

    const scorePercentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 100;
    const passed = scorePercentage >= assessment.passingScore;

    const attemptDoc = doc(collection(db, 'assessmentAttempts'));
    const now = new Date().toISOString();

    const attempt: AssessmentAttempt = {
      id: attemptDoc.id,
      assessmentId: assessment.id,
      studentId,
      programmeId: programme.id,
      answers: studentAnswers,
      score: scorePercentage,
      totalPoints: earnedPoints,
      passed,
      attemptNumber: 1,
      completedAt: now,
      createdAt: now,
    };
    await setDoc(attemptDoc, attempt);

    // Update student progress scores
    const progressDocId = `${studentId}_${programme.id}`;
    let progress = await fetchStudentProgress(studentId, programme.id);

    if (!progress) {
      progress = {
        id: progressDocId,
        studentId,
        programmeId: programme.id,
        completedLessons: [],
        completedModules: [],
        completedCourses: [],
        assessmentScores: { [assessment.id]: scorePercentage },
        finalScore: scorePercentage,
        completionPercentage: 0,
        isCompleted: false,
        completedAt: null,
        updatedAt: now,
      };
    } else {
      progress.assessmentScores = {
        ...progress.assessmentScores,
        [assessment.id]: Math.max(progress.assessmentScores[assessment.id] || 0, scorePercentage),
      };
    }

    // Recalculate metrics
    const totalRequiredCount = Math.max(1, allRequiredLessons.length);
    const completedCount = allRequiredLessons.filter((l) => progress!.completedLessons.includes(l.id)).length;
    const lessonCompletionRate = (completedCount / totalRequiredCount) * 100;

    let assessmentRate = 0;
    if (programmeAssessments.length > 0) {
      const passedAssessments = programmeAssessments.filter(
        (a) => (progress!.assessmentScores[a.id] || 0) >= a.passingScore
      ).length;
      assessmentRate = (passedAssessments / programmeAssessments.length) * 100;
    } else {
      assessmentRate = 100;
    }

    const overallPercentage = Math.round(lessonCompletionRate * 0.7 + assessmentRate * 0.3);
    progress.completionPercentage = Math.min(100, Math.max(0, overallPercentage));

    const scoresList = Object.values(progress.assessmentScores);
    const avgScore = scoresList.length > 0 ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length) : scorePercentage;
    progress.finalScore = avgScore;
    progress.updatedAt = now;

    // Check completion condition
    const allLessonsDone = allRequiredLessons.every((l) => progress!.completedLessons.includes(l.id));
    const allAssessmentsDone = programmeAssessments.every(
      (a) => (progress!.assessmentScores[a.id] || 0) >= a.passingScore
    );

    if (allLessonsDone && allAssessmentsDone && avgScore >= programme.minimumScore && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = now;
      progress.completionPercentage = 100;

      const enrollQ = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('programmeId', '==', programme.id)
      );
      const enrollSnap = await getDocs(enrollQ);
      if (!enrollSnap.empty) {
        await updateDoc(enrollSnap.docs[0].ref, {
          status: 'completed',
          progressPercentage: 100,
        });
      }

      const courses = await fetchCourses(programme.id);
      await automaticallyIssueCertificate(
        studentId,
        studentName,
        studentEmail,
        programme,
        progress,
        courses
      );
    }

    await setDoc(doc(db, 'studentProgress', progressDocId), progress, { merge: true });

    return {
      score: scorePercentage,
      passed,
      totalPoints: earnedPoints,
      attempt,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'assessmentAttempts');
  }
}
