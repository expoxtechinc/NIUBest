import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { fetchStudentEnrollments, fetchStudentProgress } from '../../lib/progressService';
import { fetchStudentCertificates, fetchStudentTranscripts } from '../../lib/certificateService';
import { fetchProgrammes } from '../../lib/academicService';
import { Enrollment, Programme, StudentProgress, Certificate, Transcript } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectProgrammeToLearn: (prog: Programme) => void;
  onExploreCatalog: () => void;
  onViewCertificate: (cert: Certificate) => void;
  onViewTranscript: (transcript: Transcript) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectProgrammeToLearn,
  onExploreCatalog,
  onViewCertificate,
  onViewTranscript,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programmes, setProgrammes] = useState<Record<string, Programme>>({});
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>({});
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function loadStudentData() {
      try {
        const [enrList, certList, transList, allProgs] = await Promise.all([
          fetchStudentEnrollments(currentUser!.uid),
          fetchStudentCertificates(currentUser!.uid),
          fetchStudentTranscripts(currentUser!.uid),
          fetchProgrammes(),
        ]);

        const progMap: Record<string, Programme> = {};
        allProgs.forEach((p) => {
          progMap[p.id] = p;
        });
        setProgrammes(progMap);
        setEnrollments(enrList);
        setCertificates(certList);
        setTranscripts(transList);

        // Fetch progress for each enrollment
        const pMap: Record<string, StudentProgress> = {};
        for (const e of enrList) {
          const p = await fetchStudentProgress(currentUser!.uid, e.programmeId);
          if (p) pMap[e.programmeId] = p;
        }
        setProgressMap(pMap);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [currentUser]);

  // Find active programme to continue
  const activeEnrollment = enrollments.find((e) => e.status === 'active') || enrollments[0];
  const activeProgramme = activeEnrollment ? programmes[activeEnrollment.programmeId] : null;
  const activeProgress = activeEnrollment ? progressMap[activeEnrollment.programmeId] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0a192f] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
            Learner Academic Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            Welcome back, {userProfile?.fullName || 'Scholar'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Continue your structured coursework, submit evaluations, and review your verified credentials.
          </p>
        </div>
      </div>

      {/* Primary: Continue Learning Card */}
      {activeProgramme && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
                Current Active Programme
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-2">
                {activeProgramme.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeProgramme.departmentName} • {activeProgramme.learningHours} Guided Learning Hours
              </p>
            </div>

            <button
              id="continue-learning-primary-btn"
              onClick={() => onSelectProgrammeToLearn(activeProgramme)}
              className="px-6 py-3 bg-[#0a192f] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Coursework Progress</span>
              <span>{activeProgress?.completionPercentage || 0}% Completed</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 rounded-full transition-all duration-500"
                style={{ width: `${activeProgress?.completionPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid: My Enrolled Programmes & Earned Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Programmes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-slate-900">
              My Certificate Programmes ({enrollments.length})
            </h2>
            <button
              onClick={onExploreCatalog}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading student records...</div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">You are not currently enrolled in any certificate</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our catalog to select a structured certificate programme aligned with your goals.
              </p>
              <button
                onClick={onExploreCatalog}
                className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Browse Programmes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => {
                const prog = programmes[enr.programmeId];
                const progProgress = progressMap[enr.programmeId];
                if (!prog) return null;

                return (
                  <div
                    key={enr.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500 uppercase">{prog.code}</span>
                        {progProgress?.isCompleted ? (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-serif font-bold text-slate-900">{prog.name}</h3>
                      <p className="text-xs text-slate-500">
                        {progProgress?.completedLessons.length || 0} lessons completed • {progProgress?.completionPercentage || 0}% overall
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectProgrammeToLearn(prog)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <span>{progProgress?.isCompleted ? 'Review Syllabus' : 'Continue'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Verified Credentials & Transcripts */}
        <div className="space-y-6">
          {/* Certificates Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-serif font-bold text-slate-900">Earned Certificates</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">{certificates.length}</span>
            </div>

            {certificates.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                Certificates are automatically awarded upon 100% completion of lessons and achieving the passing score on evaluations.
              </p>
            ) : (
              <div className="space-y-2.5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => onViewCertificate(cert)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{cert.certificateNumber}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Valid</span>
                    </div>
                    <p className="text-xs font-serif font-bold text-slate-900 line-clamp-1">
                      {cert.programmeName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Transcripts Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-serif font-bold text-slate-900">Official Transcripts</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">{transcripts.length}</span>
            </div>

            {transcripts.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                Your cumulative academic transcript record is generated automatically when a certificate is completed.
              </p>
            ) : (
              <div className="space-y-2.5">
                {transcripts.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onViewTranscript(t)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-blue-900">{t.finalResult}</span>
                      <span className="text-[10px] text-slate-500">{t.gpaOrAverage}% Avg</span>
                    </div>
                    <p className="text-xs font-serif font-bold text-slate-900 line-clamp-1">
                      {t.programmeName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      View Official Academic Record
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
