import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  School,
  Department,
  Programme,
  Course,
  Module,
  Lesson,
  LearningContent,
  Assessment,
  QuestionBankItem,
  AuditLog,
} from '../types';

// Audit Log Helper
export async function logAuditEvent(
  userId: string,
  userEmail: string,
  action: string,
  recordType: string,
  recordId: string,
  details?: string
) {
  try {
    const colRef = collection(db, 'auditLogs');
    const logDoc = doc(colRef);
    const log: AuditLog = {
      id: logDoc.id,
      userId,
      userEmail,
      action,
      recordType,
      recordId,
      details,
      timestamp: new Date().toISOString(),
    };
    await setDoc(logDoc, log);
  } catch (err) {
    console.warn('Audit logging notice:', err);
  }
}

// ----------------------------------------------------
// Schools & Departments
// ----------------------------------------------------
export async function fetchSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, 'schools'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as School[];
  } catch (err) {
    console.warn('fetchSchools notice:', err);
    return [];
  }
}

export async function fetchDepartments(schoolId?: string): Promise<Department[]> {
  try {
    let qRef;
    if (schoolId) {
      qRef = query(collection(db, 'departments'), where('schoolId', '==', schoolId));
    } else {
      qRef = collection(db, 'departments');
    }
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Department[];
  } catch (err) {
    console.warn('fetchDepartments notice:', err);
    return [];
  }
}

export async function saveSchool(school: Partial<School>): Promise<string> {
  try {
    const sDoc = school.id ? doc(db, 'schools', school.id) : doc(collection(db, 'schools'));
    const now = new Date().toISOString();
    const data: School = {
      id: sDoc.id,
      name: school.name || 'New School',
      code: school.code || 'SCH',
      description: school.description || '',
      dean: school.dean || 'Faculty Dean',
      createdAt: school.createdAt || now,
      updatedAt: now,
    };
    await setDoc(sDoc, data, { merge: true });
    return sDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'schools');
  }
}

export async function deleteSchool(schoolId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'schools', schoolId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `schools/${schoolId}`);
  }
}

export async function saveDepartment(dept: Partial<Department>): Promise<string> {
  try {
    const dDoc = dept.id ? doc(db, 'departments', dept.id) : doc(collection(db, 'departments'));
    const now = new Date().toISOString();
    const data: Department = {
      id: dDoc.id,
      schoolId: dept.schoolId || '',
      name: dept.name || 'New Department',
      code: dept.code || 'DEPT',
      description: dept.description || '',
      createdAt: dept.createdAt || now,
      updatedAt: now,
    };
    await setDoc(dDoc, data, { merge: true });
    return dDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'departments');
  }
}

export async function deleteDepartment(departmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'departments', departmentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `departments/${departmentId}`);
  }
}

// ----------------------------------------------------
// Academic Programmes
// ----------------------------------------------------
export async function fetchProgrammes(status?: string, isAdmin?: boolean): Promise<Programme[]> {
  try {
    const col = collection(db, 'programmes');
    const targetStatus = status || (!isAdmin ? 'Published' : undefined);
    const qRef = targetStatus ? query(col, where('status', '==', targetStatus)) : col;
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Programme[];
  } catch (err) {
    console.warn('fetchProgrammes notice:', err);
    return [];
  }
}

export async function fetchProgrammeById(id: string): Promise<Programme | null> {
  try {
    const snap = await getDoc(doc(db, 'programmes', id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as any) } as Programme;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `programmes/${id}`);
  }
}

export async function saveProgramme(prog: Partial<Programme>, userEmail: string): Promise<string> {
  try {
    const col = collection(db, 'programmes');
    const progDoc = prog.id ? doc(db, 'programmes', prog.id) : doc(col);
    const now = new Date().toISOString();

    const data: Programme = {
      id: progDoc.id,
      name: prog.name || 'Untitled Certificate Programme',
      code: prog.code || `NIU-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: prog.departmentId || '',
      departmentName: prog.departmentName || 'Department of Professional Studies',
      description: prog.description || '',
      learningHours: prog.learningHours || 40,
      difficulty: prog.difficulty || 'Beginner',
      objectives: prog.objectives || '',
      learningOutcomes: prog.learningOutcomes || '',
      entryRequirements: prog.entryRequirements || 'Open admission for adult learners and working professionals.',
      completionRequirements: prog.completionRequirements || 'Complete all lessons and achieve minimum 70% in assessments.',
      minimumScore: prog.minimumScore || 70,
      imageUrl: prog.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      status: prog.status || 'Draft',
      createdAt: prog.createdAt || now,
      updatedAt: now,
      createdBy: userEmail,
    };

    await setDoc(progDoc, data, { merge: true });
    await logAuditEvent(userEmail, userEmail, prog.id ? 'UPDATE_PROGRAMME' : 'CREATE_PROGRAMME', 'Programme', progDoc.id);
    return progDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `programmes/${prog.id || 'new'}`);
  }
}

export async function deleteProgramme(programmeId: string, userEmail: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'programmes', programmeId));
    await logAuditEvent(userEmail, userEmail, 'DELETE_PROGRAMME', 'Programme', programmeId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `programmes/${programmeId}`);
  }
}

// ----------------------------------------------------
// Courses
// ----------------------------------------------------
export async function fetchCourses(programmeId: string): Promise<Course[]> {
  try {
    const qRef = query(collection(db, 'courses'), where('programmeId', '==', programmeId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Course[];
    return list.sort((a, b) => (a.courseOrder ?? 0) - (b.courseOrder ?? 0));
  } catch (err) {
    console.warn('fetchCourses notice:', err);
    return [];
  }
}

export async function saveCourse(course: Partial<Course>): Promise<string> {
  try {
    const col = collection(db, 'courses');
    const courseDoc = course.id ? doc(db, 'courses', course.id) : doc(col);
    const now = new Date().toISOString();

    const data: Course = {
      id: courseDoc.id,
      programmeId: course.programmeId!,
      title: course.title || 'Untitled Course',
      description: course.description || '',
      outcomes: course.outcomes || '',
      learningMinutes: course.learningMinutes || 600,
      difficulty: course.difficulty || 'Beginner',
      category: course.category || 'Core Academic',
      entryRequirements: course.entryRequirements || '',
      courseOrder: course.courseOrder ?? 1,
      createdAt: course.createdAt || now,
      updatedAt: now,
    };

    await setDoc(courseDoc, data, { merge: true });
    return courseDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `courses/${course.id || 'new'}`);
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
  }
}

// ----------------------------------------------------
// Modules
// ----------------------------------------------------
export async function fetchModules(courseId: string): Promise<Module[]> {
  try {
    const qRef = query(collection(db, 'modules'), where('courseId', '==', courseId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Module[];
    return list.sort((a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0));
  } catch (err) {
    console.warn('fetchModules notice:', err);
    return [];
  }
}

export async function saveModule(mod: Partial<Module>): Promise<string> {
  try {
    const col = collection(db, 'modules');
    const modDoc = mod.id ? doc(db, 'modules', mod.id) : doc(col);
    const now = new Date().toISOString();

    const data: Module = {
      id: modDoc.id,
      programmeId: mod.programmeId!,
      courseId: mod.courseId!,
      title: mod.title || 'Untitled Module',
      description: mod.description || '',
      objectives: mod.objectives || '',
      estimatedMinutes: mod.estimatedMinutes || 120,
      moduleOrder: mod.moduleOrder ?? 1,
      learnerSupportGuidance: mod.learnerSupportGuidance || '',
      createdAt: mod.createdAt || now,
      updatedAt: now,
    };

    await setDoc(modDoc, data, { merge: true });
    return modDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `modules/${mod.id || 'new'}`);
  }
}

export async function deleteModule(moduleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'modules', moduleId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `modules/${moduleId}`);
  }
}

// ----------------------------------------------------
// Lessons
// ----------------------------------------------------
export async function fetchLessons(moduleId: string): Promise<Lesson[]> {
  try {
    const qRef = query(collection(db, 'lessons'), where('moduleId', '==', moduleId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Lesson[];
    return list.sort((a, b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0));
  } catch (err) {
    console.warn('fetchLessons notice:', err);
    return [];
  }
}

export async function saveLesson(lesson: Partial<Lesson>): Promise<string> {
  try {
    const col = collection(db, 'lessons');
    const lessonDoc = lesson.id ? doc(db, 'lessons', lesson.id) : doc(col);
    const now = new Date().toISOString();

    const data: Lesson = {
      id: lessonDoc.id,
      programmeId: lesson.programmeId!,
      courseId: lesson.courseId!,
      moduleId: lesson.moduleId!,
      title: lesson.title || 'Untitled Lesson',
      description: lesson.description || '',
      objectives: lesson.objectives || '',
      activityType: lesson.activityType || 'Reading',
      estimatedMinutes: lesson.estimatedMinutes || 30,
      points: lesson.points ?? 10,
      isRequired: lesson.isRequired ?? true,
      lessonOrder: lesson.lessonOrder ?? 1,
      createdAt: lesson.createdAt || now,
      updatedAt: now,
    };

    await setDoc(lessonDoc, data, { merge: true });
    return lessonDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `lessons/${lesson.id || 'new'}`);
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
    await deleteDoc(doc(db, 'learningContent', lessonId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `lessons/${lessonId}`);
  }
}

// ----------------------------------------------------
// Learning Content (14 Structured Academic Sections)
// ----------------------------------------------------
export async function fetchLearningContent(lessonId: string): Promise<LearningContent | null> {
  try {
    const snap = await getDoc(doc(db, 'learningContent', lessonId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as any) } as LearningContent;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `learningContent/${lessonId}`);
  }
}

export async function saveLearningContent(content: Partial<LearningContent>): Promise<void> {
  try {
    const docRef = doc(db, 'learningContent', content.lessonId!);
    const now = new Date().toISOString();

    const textValues = Object.values(content.sections || {}).join(' ');
    const wordCount = textValues.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const data: LearningContent = {
      id: content.lessonId!,
      programmeId: content.programmeId!,
      courseId: content.courseId || '',
      moduleId: content.moduleId || '',
      lessonId: content.lessonId!,
      sections: content.sections as any,
      wordCount,
      readingTime,
      isDraft: content.isDraft ?? false,
      updatedAt: now,
    };

    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `learningContent/${content.lessonId}`);
  }
}

// ----------------------------------------------------
// Assessments
// ----------------------------------------------------
export async function fetchAssessments(programmeId: string): Promise<Assessment[]> {
  try {
    const qRef = query(collection(db, 'assessments'), where('programmeId', '==', programmeId));
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Assessment[];
  } catch (err) {
    console.warn('fetchAssessments notice:', err);
    return [];
  }
}

export async function saveAssessment(assessment: Partial<Assessment>): Promise<string> {
  try {
    const col = collection(db, 'assessments');
    const aDoc = assessment.id ? doc(db, 'assessments', assessment.id) : doc(col);
    const now = new Date().toISOString();

    const data: Assessment = {
      id: aDoc.id,
      programmeId: assessment.programmeId!,
      courseId: assessment.courseId || '',
      moduleId: assessment.moduleId || '',
      lessonId: assessment.lessonId || '',
      title: assessment.title || 'Course Assessment',
      instructions: assessment.instructions || 'Review all questions carefully before submitting.',
      assessmentType: assessment.assessmentType || 'Quiz',
      passingScore: assessment.passingScore ?? 70,
      totalPoints: assessment.totalPoints ?? 100,
      timeLimitMinutes: assessment.timeLimitMinutes ?? 30,
      attemptsAllowed: assessment.attemptsAllowed ?? 3,
      assessmentWeight: assessment.assessmentWeight ?? 100,
      questionIds: assessment.questionIds || [],
      createdAt: assessment.createdAt || now,
      updatedAt: now,
    };

    await setDoc(aDoc, data, { merge: true });
    return aDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `assessments/${assessment.id || 'new'}`);
  }
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'assessments', assessmentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `assessments/${assessmentId}`);
  }
}

// ----------------------------------------------------
// Question Banks & Questions
// ----------------------------------------------------
export async function fetchQuestions(): Promise<QuestionBankItem[]> {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as QuestionBankItem[];
  } catch (err) {
    console.warn('fetchQuestions notice:', err);
    return [];
  }
}

export async function saveQuestion(question: Partial<QuestionBankItem>): Promise<string> {
  try {
    const col = collection(db, 'questions');
    const qDoc = question.id ? doc(db, 'questions', question.id) : doc(col);
    const now = new Date().toISOString();

    const data: QuestionBankItem = {
      id: qDoc.id,
      bankId: question.bankId || 'general',
      questionText: question.questionText || '',
      questionType: question.questionType || 'multiple_choice',
      options: question.options || [],
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || '',
      points: question.points ?? 10,
      difficulty: question.difficulty || 'Intermediate',
      category: question.category || 'General',
      status: question.status || 'Approved',
      createdAt: question.createdAt || now,
      updatedAt: now,
    };

    await setDoc(qDoc, data, { merge: true });
    return qDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${question.id || 'new'}`);
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions/${questionId}`);
  }
}

// ----------------------------------------------------
// Admin Purge Tool (Wipes demo/sample data on demand)
// ----------------------------------------------------
export async function purgeAllDemoCatalogData(userEmail: string): Promise<{ deletedCount: number }> {
  let count = 0;
  const collectionsToClean = [
    'programmes',
    'courses',
    'modules',
    'lessons',
    'learningContent',
    'assessments',
    'questions',
    'schools',
    'departments',
  ];

  for (const colName of collectionsToClean) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        count++;
      }
    } catch (err) {
      console.warn(`Purge notice on ${colName}:`, err);
    }
  }

  await logAuditEvent(
    userEmail,
    userEmail,
    'PURGE_CATALOG_DATA',
    'System',
    'all',
    `Purged ${count} catalog documents to reset to clean slate`
  );

  return { deletedCount: count };
}

// Kept as an empty no-op so no demo programmes are ever seeded automatically
export async function seedInitialAcademicDataIfEmpty(userEmail?: string): Promise<void> {
  // Deliberate no-op: Administrator will create all official programmes via the Academic Production Studio
  return;
}
