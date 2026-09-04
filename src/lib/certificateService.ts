import QRCode from 'qrcode';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Certificate,
  Transcript,
  VerificationRecord,
  Programme,
  StudentProgress,
  TranscriptCourseEntry,
} from '../types';

export const FOUNDER_SIGNATURE = 'akinssokpah';

export function generateRandomCode(prefix: string, length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export async function generateQrCodeDataUrl(verifyUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 200,
      color: {
        dark: '#0f2744',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    return '';
  }
}

export async function fetchCertificateById(certId: string): Promise<Certificate | null> {
  try {
    const snap = await getDoc(doc(db, 'certificates', certId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Certificate;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `certificates/${certId}`);
  }
}

export async function fetchStudentCertificates(studentId: string): Promise<Certificate[]> {
  try {
    const qRef = query(collection(db, 'certificates'), where('studentId', '==', studentId));
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Certificate[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'certificates');
  }
}

export async function fetchAllCertificates(): Promise<Certificate[]> {
  try {
    const snap = await getDocs(collection(db, 'certificates'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Certificate[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'certificates');
  }
}

export async function verifyCertificateRecord(codeOrId: string): Promise<VerificationRecord | null> {
  try {
    const cleanLookup = codeOrId.trim();
    // Try by certificateId
    const directSnap = await getDoc(doc(db, 'verificationRecords', cleanLookup));
    if (directSnap.exists()) {
      return { id: directSnap.id, ...(directSnap.data() as any) } as VerificationRecord;
    }

    // Try query by certificateNumber or verificationCode
    const qNum = query(collection(db, 'verificationRecords'), where('certificateNumber', '==', cleanLookup));
    const snapNum = await getDocs(qNum);
    if (!snapNum.empty) {
      const d = snapNum.docs[0];
      return { id: d.id, ...(d.data() as any) } as VerificationRecord;
    }

    const qCode = query(collection(db, 'verificationRecords'), where('verificationCode', '==', cleanLookup));
    const snapCode = await getDocs(qCode);
    if (!snapCode.empty) {
      const d = snapCode.docs[0];
      return { id: d.id, ...(d.data() as any) } as VerificationRecord;
    }

    return null;
  } catch (err) {
    console.warn('Verification lookup note:', err);
    return null;
  }
}

export async function automaticallyIssueCertificate(
  studentId: string,
  studentName: string,
  studentEmail: string,
  programme: Programme,
  progress: StudentProgress,
  courses: { id: string; title: string; learningMinutes: number }[]
): Promise<Certificate> {
  try {
    // Check if certificate already exists for this student and programme
    const existingQ = query(
      collection(db, 'certificates'),
      where('studentId', '==', studentId),
      where('programmeId', '==', programme.id)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      const existingCert = existingSnap.docs[0].data() as Certificate;
      return existingCert;
    }

    const certDoc = doc(collection(db, 'certificates'));
    const certNumber = generateRandomCode(`NIU-${programme.code.split('-').pop() || 'CERT'}`, 7);
    const verificationCode = generateRandomCode('VRF', 8);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://niu.ac.digital';
    const verifyUrl = `${baseUrl}/verify/${certDoc.id}`;
    const qrDataUrl = await generateQrCodeDataUrl(verifyUrl);

    const now = new Date().toISOString();

    const cert: Certificate = {
      id: certDoc.id,
      certificateNumber: certNumber,
      verificationCode: verificationCode,
      studentId,
      studentName,
      studentEmail,
      programmeId: programme.id,
      programmeName: programme.name,
      programmeCode: programme.code,
      issueDate: now,
      founderSignature: FOUNDER_SIGNATURE,
      status: 'Valid',
      qrCodeDataUrl: qrDataUrl,
      metadata: {
        totalHours: programme.learningHours,
        finalScore: progress.finalScore,
        completionDate: now,
      },
      createdAt: now,
    };

    // 1. Save Certificate
    await setDoc(certDoc, cert);

    // 2. Save public Verification Record
    const verifyDoc = doc(db, 'verificationRecords', certDoc.id);
    const record: VerificationRecord = {
      id: certDoc.id,
      certificateId: certDoc.id,
      certificateNumber: certNumber,
      verificationCode: verificationCode,
      studentName,
      programmeName: programme.name,
      programmeCode: programme.code,
      issueDate: now,
      status: 'Valid',
      verifiedCount: 0,
      lastVerifiedAt: now,
    };
    await setDoc(verifyDoc, record);

    // 3. Automatically generate / update Student Academic Transcript
    const transcriptDoc = doc(collection(db, 'transcripts'));
    const transcriptCourses: TranscriptCourseEntry[] = courses.map((c) => ({
      courseId: c.id,
      courseTitle: c.title,
      learningHours: Math.round(c.learningMinutes / 60) || 10,
      status: 'Completed',
      score: progress.finalScore || 85,
      completionDate: now,
    }));

    let resultGrade: 'Distinction' | 'Merit' | 'Pass' = 'Pass';
    if (progress.finalScore >= 90) resultGrade = 'Distinction';
    else if (progress.finalScore >= 80) resultGrade = 'Merit';

    const transcript: Transcript = {
      id: transcriptDoc.id,
      studentId,
      studentName,
      studentEmail,
      programmeId: programme.id,
      programmeName: programme.name,
      programmeCode: programme.code,
      courses: transcriptCourses,
      finalResult: resultGrade,
      issueDate: now,
      gpaOrAverage: progress.finalScore,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(transcriptDoc, transcript);

    return cert;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'certificates');
  }
}

export async function fetchStudentTranscripts(studentId: string): Promise<Transcript[]> {
  try {
    const qRef = query(collection(db, 'transcripts'), where('studentId', '==', studentId));
    const snap = await getDocs(qRef);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Transcript[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transcripts');
  }
}

export async function fetchAllTranscripts(): Promise<Transcript[]> {
  try {
    const snap = await getDocs(collection(db, 'transcripts'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Transcript[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transcripts');
  }
}

export async function revokeCertificate(certificateId: string, reason: string): Promise<void> {
  try {
    const certRef = doc(db, 'certificates', certificateId);
    const certSnap = await getDoc(certRef);
    if (!certSnap.exists()) {
      throw new Error('Certificate does not exist.');
    }
    const cert = certSnap.data() as Certificate;
    const now = new Date().toISOString();

    // Update Certificate
    await setDoc(
      certRef,
      {
        ...cert,
        status: 'revoked',
        revokedAt: now,
        revocationReason: reason,
        updatedAt: now,
      },
      { merge: true }
    );

    // Update Verification Record
    const vQuery = query(
      collection(db, 'verificationRecords'),
      where('certificateId', '==', certificateId)
    );
    const vSnap = await getDocs(vQuery);
    for (const vDoc of vSnap.docs) {
      await setDoc(
        vDoc.ref,
        {
          status: 'revoked',
          revokedAt: now,
          revocationReason: reason,
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `certificates/${certificateId}`);
  }
}

