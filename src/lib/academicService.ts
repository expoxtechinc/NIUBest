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
  onSnapshot,
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
  LearningResource,
  Assessment,
  QuestionBank,
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
    console.warn('Audit logging note:', err);
  }
}

// Schools & Departments
export async function fetchSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, 'schools'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as School[];
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'schools');
  }
}

export async function fetchDepartments(schoolId?: string): Promise<Department[]> {
  try {
    let q = collection(db, 'departments');
    if (schoolId) {
      const qRef = query(collection(db, 'departments'), where('schoolId', '==', schoolId));
      const snap = await getDocs(qRef);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Department[];
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Department[];
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'departments');
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

// Programmes
export async function fetchProgrammes(status?: string): Promise<Programme[]> {
  try {
    const col = collection(db, 'programmes');
    const snap = await getDocs(col);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Programme[];
    if (status) {
      return list.filter((p) => p.status === status);
    }
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'programmes');
  }
}

export async function fetchProgrammeById(id: string): Promise<Programme | null> {
  try {
    const snap = await getDoc(doc(db, 'programmes', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Programme;
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
      departmentName: prog.departmentName || 'Department of Interdisciplinary Studies',
      description: prog.description || '',
      learningHours: prog.learningHours || 40,
      difficulty: prog.difficulty || 'Beginner',
      objectives: prog.objectives || '',
      learningOutcomes: prog.learningOutcomes || '',
      entryRequirements: prog.entryRequirements || 'Open admission for adult learners.',
      completionRequirements: prog.completionRequirements || 'Complete all modules and achieve minimum 70% in assessments.',
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

// Courses
export async function fetchCourses(programmeId: string): Promise<Course[]> {
  try {
    const qRef = query(collection(db, 'courses'), where('programmeId', '==', programmeId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Course[];
    return list.sort((a, b) => a.courseOrder - b.courseOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'courses');
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

// Modules
export async function fetchModules(courseId: string): Promise<Module[]> {
  try {
    const qRef = query(collection(db, 'modules'), where('courseId', '==', courseId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Module[];
    return list.sort((a, b) => a.moduleOrder - b.moduleOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'modules');
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

// Lessons
export async function fetchLessons(moduleId: string): Promise<Lesson[]> {
  try {
    const qRef = query(collection(db, 'lessons'), where('moduleId', '==', moduleId));
    const snap = await getDocs(qRef);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Lesson[];
    return list.sort((a, b) => a.lessonOrder - b.lessonOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'lessons');
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

// Learning Content (14 Structured Academic Sections)
export async function fetchLearningContent(lessonId: string): Promise<LearningContent | null> {
  try {
    const snap = await getDoc(doc(db, 'learningContent', lessonId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as LearningContent;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `learningContent/${lessonId}`);
  }
}

export async function saveLearningContent(content: Partial<LearningContent>): Promise<void> {
  try {
    const docRef = doc(db, 'learningContent', content.lessonId!);
    const now = new Date().toISOString();

    // calculate total word count across all 14 sections
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

// Assessments
export async function fetchAssessments(programmeId: string): Promise<Assessment[]> {
  try {
    const qRef = query(collection(db, 'assessments'), where('programmeId', '==', programmeId));
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Assessment[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'assessments');
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

// Question Banks & Questions
export async function fetchQuestions(): Promise<QuestionBankItem[]> {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as QuestionBankItem[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'questions');
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

// Initial Institutional Database Bootstrapper
export async function seedInitialAcademicDataIfEmpty(userEmail: string = 'academic.registry@niu.ac.digital'): Promise<void> {
  try {
    const progSnap = await getDocs(collection(db, 'programmes'));
    if (!progSnap.empty) {
      // Data already seeded
      return;
    }

    console.log('Bootstrapping foundational NIU academic catalog...');
    const now = new Date().toISOString();

    // 1. Schools
    const schoolTechDoc = doc(collection(db, 'schools'));
    const schoolTech: School = {
      id: schoolTechDoc.id,
      name: 'School of Digital Technologies & Computing',
      code: 'TECH',
      description: 'Advancing rigorous professional skills in software architectures, cyber resilience, and cloud computing.',
      dean: 'Dr. Marcus Vance, Ph.D.',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(schoolTechDoc, schoolTech);

    const schoolHealthDoc = doc(collection(db, 'schools'));
    const schoolHealth: School = {
      id: schoolHealthDoc.id,
      name: 'School of Health Informatics & Systems',
      code: 'HEALTH',
      description: 'Equipping clinical and health tech specialists with data systems leadership and privacy frameworks.',
      dean: 'Dr. Evelyn Morales, MD, MS',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(schoolHealthDoc, schoolHealth);

    // 2. Departments
    const deptCyberDoc = doc(collection(db, 'departments'));
    const deptCyber: Department = {
      id: deptCyberDoc.id,
      schoolId: schoolTechDoc.id,
      schoolName: schoolTech.name,
      name: 'Department of Cybersecurity & Cloud Infrastructure',
      code: 'CYB',
      description: 'Focused on enterprise defense architectures, threat analysis, and zero-trust engineering.',
      headOfDepartment: 'Prof. Julian Sterling',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(deptCyberDoc, deptCyber);

    // 3. Programme: Certificate in Applied Cybersecurity & Zero Trust Architecture
    const prog1Doc = doc(collection(db, 'programmes'));
    const prog1: Programme = {
      id: prog1Doc.id,
      name: 'Certificate in Applied Cybersecurity & Zero Trust Architecture',
      code: 'NIU-CERT-CYB401',
      departmentId: deptCyberDoc.id,
      departmentName: deptCyber.name,
      description: 'An intensive, industry-aligned certificate programme examining modern defense-in-depth principles, cryptographic foundations, identity boundary enforcement, and cloud workload isolation.',
      learningHours: 48,
      difficulty: 'Intermediate',
      objectives: '1. Master Zero Trust perimeter design.\n2. Analyze cryptanalytic threats and TLS 1.3 implementation.\n3. Deploy automated security policies across distributed clouds.\n4. Formulate incident response and digital forensics workflows.',
      learningOutcomes: 'Upon completion, learners will be able to evaluate enterprise threat models, implement multi-factor cryptographic boundaries, audit cloud security configurations, and ensure compliance with NIST standards.',
      entryRequirements: 'Basic familiarity with computer networking and operating systems.',
      completionRequirements: 'Completion of all 3 course modules, 100% lesson engagement, and minimum 75% on the capstone evaluation.',
      minimumScore: 75,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
      status: 'Published',
      createdAt: now,
      updatedAt: now,
      createdBy: userEmail,
    };
    await setDoc(prog1Doc, prog1);

    // Course 1
    const course1Doc = doc(collection(db, 'courses'));
    const course1: Course = {
      id: course1Doc.id,
      programmeId: prog1Doc.id,
      title: 'Foundations of Zero Trust & Identity Security',
      description: 'Examining the paradigm shift from castle-and-moat perimeter defense to continuous verification.',
      outcomes: 'Differentiate between legacy perimeter models and identity-as-a-boundary architectures.',
      learningMinutes: 720,
      difficulty: 'Intermediate',
      category: 'Core Cyber Defense',
      courseOrder: 1,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(course1Doc, course1);

    // Module 1
    const mod1Doc = doc(collection(db, 'modules'));
    const mod1: Module = {
      id: mod1Doc.id,
      programmeId: prog1Doc.id,
      courseId: course1Doc.id,
      title: 'Zero Trust Principles and Identity Governance',
      description: 'Continuous authentication, least privilege enforcement, and micro-segmentation basics.',
      objectives: 'Understand the three core pillars of Zero Trust architecture as formulated by NIST SP 800-207.',
      estimatedMinutes: 240,
      moduleOrder: 1,
      learnerSupportGuidance: 'Review NIST reference diagrams before reading the main text.',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(mod1Doc, mod1);

    // Lesson 1
    const lesson1Doc = doc(collection(db, 'lessons'));
    const lesson1: Lesson = {
      id: lesson1Doc.id,
      programmeId: prog1Doc.id,
      courseId: course1Doc.id,
      moduleId: mod1Doc.id,
      title: 'Deconstructing Castle-and-Moat: The Identity Boundary',
      description: 'Why static network boundaries fail in modern cloud-first enterprises.',
      objectives: 'Identify the vulnerabilities inherent in static IP trust zones.',
      activityType: 'Reading',
      estimatedMinutes: 35,
      points: 20,
      isRequired: true,
      lessonOrder: 1,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(lesson1Doc, lesson1);

    // Learning Content for Lesson 1 (Complete 14-section academic structure)
    const content1Doc = doc(db, 'learningContent', lesson1Doc.id);
    const content1: LearningContent = {
      id: lesson1Doc.id,
      programmeId: prog1Doc.id,
      courseId: course1Doc.id,
      moduleId: mod1Doc.id,
      lessonId: lesson1Doc.id,
      sections: {
        introduction: 'Welcome to this foundational study on Zero Trust architectures. In the classical enterprise model, internal networks were treated with implicit trust once an entity traversed the external firewall. Today, distributed workforces and multi-cloud architectures render this paradigm dangerous.',
        learningObjectives: '1. Articulate the breakdown of traditional IP-based perimeter trust.\n2. Define the core tenets of NIST Special Publication 800-207.\n3. Evaluate dynamic context-aware authorization matrices.',
        prerequisites: 'Basic knowledge of TCP/IP networking, DNS resolution, and asymmetric cryptography.',
        mainContent: 'Zero Trust is an institutional security model that treats every request as though it originated from an uncontrolled network. Rather than granting broad ambient privileges following initial authentication, Zero Trust requires explicit verification of identity, device health, data classification, and environmental context before granting temporal, scoped access to discrete resources.',
        keyConcepts: '• Explicit Verification: Always authenticate and authorize based on all available data points.\n• Least-Privilege Access: Limit user access with Just-In-Time (JIT) and Just-Enough-Access (JEA).\n• Assume Breach: Minimize blast radius by micro-segmenting networks, users, and workloads.',
        examples: 'Consider an engineer accessing an internal database: Under traditional rules, VPN connection provided unmonitored lateral access. Under Zero Trust, access to the database requires a dedicated session token validated by an Identity-Aware Proxy that inspects device encryption status and geo-velocity.',
        practicalApplication: 'When provisioning cloud workloads in AWS or GCP, replace static bastion hosts with ephemeral identity-federated tunnels that evaluate posture before session establishment.',
        caseStudy: 'In 2021, an international logistics enterprise suffered lateral privilege escalation when an attacker compromised a low-tier IoT monitoring device. Implementing micro-segmentation and strict mutual TLS (mTLS) would have isolated the compromised node, containing the breach within minutes.',
        activity: 'Draft an architectural diagram mapping a remote client connecting to an internal CRM service through an Identity-Aware Proxy.',
        selfCheck: '1. Why does IP whitelisting fail in serverless cloud environments?\n2. What is the role of continuous attestation versus one-time session validation?',
        keyTakeaways: 'Perimeters are logical, not physical. Identity is the modern security control plane. Never trust, always verify.',
        glossary: '• mTLS (Mutual Transport Layer Security): Two-way cryptographic authentication between client and server.\n• PDP (Policy Decision Point): The system engine evaluating access rules.\n• PEP (Policy Enforcement Point): The gateway intercepting and mediating communication.',
        conclusion: 'By shifting focus from network topography to authenticated, contextual identities, modern digital institutions preserve data integrity regardless of physical topology.',
        furtherReading: 'NIST Special Publication 800-207: Zero Trust Architecture; National Security Agency (NSA) Guidance on Embracing a Zero Trust Security Model.',
      },
      wordCount: 780,
      readingTime: 4,
      isDraft: false,
      updatedAt: now,
    };
    await setDoc(content1Doc, content1);

    // Questions
    const q1Doc = doc(collection(db, 'questions'));
    const q1: QuestionBankItem = {
      id: q1Doc.id,
      bankId: 'cyber-fundamentals',
      questionText: 'What is the foundational premise of the Zero Trust Architecture model as defined by NIST SP 800-207?',
      questionType: 'multiple_choice',
      options: [
        'Implicit trust is granted to all traffic originating within internal VLANs',
        'No implicit trust is granted to assets or user accounts based solely on their physical or network location',
        'Firewalls are completely eliminated in favor of passive intrusion detection',
        'Only biometric authentication is permitted across network boundaries',
      ],
      correctAnswer: 'No implicit trust is granted to assets or user accounts based solely on their physical or network location',
      explanation: 'Zero Trust mandates explicit verification regardless of whether the request originates from an internal subnet or the public internet.',
      points: 25,
      difficulty: 'Intermediate',
      category: 'Cybersecurity',
      status: 'Approved',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(q1Doc, q1);

    const q2Doc = doc(collection(db, 'questions'));
    const q2: QuestionBankItem = {
      id: q2Doc.id,
      bankId: 'cyber-fundamentals',
      questionText: 'In Zero Trust terminology, what is the role of the Policy Enforcement Point (PEP)?',
      questionType: 'multiple_choice',
      options: [
        'To write and store company HR policies in a document database',
        'To decrypt all SSL traffic for permanent offline archival',
        'To intercept, inspect, and either enable or terminate communication between a subject and an enterprise resource',
        'To automatically issue administrative privileges to any verified email address',
      ],
      correctAnswer: 'To intercept, inspect, and either enable or terminate communication between a subject and an enterprise resource',
      explanation: 'The PEP is the boundary gateway that enforces the authorization decision rendered by the Policy Decision Point (PDP).',
      points: 25,
      difficulty: 'Intermediate',
      category: 'Cybersecurity',
      status: 'Approved',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(q2Doc, q2);

    // Assessment linked to Lesson 1 & Course 1
    const assessDoc = doc(collection(db, 'assessments'));
    const assess: Assessment = {
      id: assessDoc.id,
      programmeId: prog1Doc.id,
      courseId: course1Doc.id,
      moduleId: mod1Doc.id,
      lessonId: lesson1Doc.id,
      title: 'Zero Trust Principles & Architecture Comprehensive Check',
      instructions: 'Answer both questions to demonstrate mastery of Zero Trust fundamentals. Passing score is 75%.',
      assessmentType: 'Quiz',
      passingScore: 75,
      totalPoints: 50,
      timeLimitMinutes: 15,
      attemptsAllowed: 3,
      assessmentWeight: 30,
      questionIds: [q1Doc.id, q2Doc.id],
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(assessDoc, assess);

    // Second Published Programme: Certificate in Sustainable Energy Systems
    const prog2Doc = doc(collection(db, 'programmes'));
    const prog2: Programme = {
      id: prog2Doc.id,
      name: 'Certificate in Sustainable Energy Systems & Grid Decarbonization',
      code: 'NIU-CERT-ENG202',
      departmentId: deptCyberDoc.id,
      departmentName: 'Department of Applied Sciences & Infrastructure',
      description: 'An academic certificate exploring the technical, logistical, and computational foundations of modern renewable grid integration, distributed generation, and storage technologies.',
      learningHours: 36,
      difficulty: 'Beginner',
      objectives: '1. Understand renewable energy capture fundamentals.\n2. Analyze grid balancing and battery storage systems.\n3. Evaluate regulatory standards for decarbonization.',
      learningOutcomes: 'Formulate grid resilience models incorporating intermittent solar and wind resources.',
      entryRequirements: 'Open admission for students interested in clean energy transitions.',
      completionRequirements: 'Complete all lessons and pass the final evaluation with at least 70%.',
      minimumScore: 70,
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
      status: 'Published',
      createdAt: now,
      updatedAt: now,
      createdBy: userEmail,
    };
    await setDoc(prog2Doc, prog2);

    console.log('NIU foundational academic data bootstrapped successfully.');
  } catch (err) {
    console.error('Error during initial academic data seed:', err);
  }
}
