import React, { useState, useEffect } from 'react';
import { Programme, Course, Module, Lesson } from '../../types';
import { fetchCourses, fetchModules, fetchLessons } from '../../lib/academicService';
import { useAuth } from '../../lib/authContext';
import { enrollStudent } from '../../lib/progressService';
import {
  X,
  Clock,
  Award,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ProgrammeDetailModalProps {
  programme: Programme | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onStartLearning: (prog: Programme) => void;
}

export const ProgrammeDetailModal: React.FC<ProgrammeDetailModalProps> = ({
  programme,
  onClose,
  onOpenAuth,
  onStartLearning,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('overview');

  useEffect(() => {
    if (!programme) return;
    async function loadCurriculum() {
      setLoading(true);
      try {
        const cList = await fetchCourses(programme!.id);
        setCourses(cList);
      } catch (err) {
        console.error('Curriculum load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCurriculum();
  }, [programme]);

  if (!programme) return null;

  const handleEnroll = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setEnrolling(true);
    try {
      await enrollStudent(
        currentUser.uid,
        currentUser.email || '',
        userProfile?.fullName || 'Student',
        programme
      );
      onClose();
      onStartLearning(programme);
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0a192f] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold block">
            {programme.departmentName || 'Academic Department'} • {programme.code}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1 pr-8">
            {programme.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>{programme.learningHours} Guided Learning Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Passing Score: {programme.minimumScore}%</span>
            </div>
            <div className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded text-[11px] font-medium">
              {programme.difficulty} Level
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-900 text-blue-950 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Programme Overview & Outcomes
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'curriculum'
                ? 'border-blue-900 text-blue-950 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Curriculum Structure ({courses.length} Courses)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm text-slate-700">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Academic Description
                </h3>
                <p className="text-slate-600 leading-relaxed">{programme.description}</p>
              </div>

              {programme.objectives && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Key Objectives
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed">
                    {programme.objectives}
                  </div>
                </div>
              )}

              {programme.learningOutcomes && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Learning Outcomes
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed">
                    {programme.learningOutcomes}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <h4 className="text-xs font-semibold text-slate-900 mb-1">Entry Requirements</h4>
                  <p className="text-xs text-slate-600">{programme.entryRequirements}</p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <h4 className="text-xs font-semibold text-slate-900 mb-1">Completion Criteria</h4>
                  <p className="text-xs text-slate-600">{programme.completionRequirements}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Institutional Scope:</strong> NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-slate-400">Loading course syllabus...</div>
              ) : courses.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg">
                  Curriculum courses are being organized. Check back shortly.
                </div>
              ) : (
                courses.map((course, idx) => (
                  <div key={course.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        Course {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500">{course.learningMinutes} mins</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                    <p className="text-xs text-slate-600">{course.description}</p>
                    {course.outcomes && (
                      <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                        Outcomes: {course.outcomes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>

          <button
            id="modal-enroll-btn"
            disabled={enrolling}
            onClick={handleEnroll}
            className="px-5 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {enrolling ? (
              'Enrolling Learner...'
            ) : currentUser ? (
              <>
                <span>Enroll in Certificate Programme</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Enroll</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
