import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import {
  Programme,
  Course,
  Module,
  Lesson,
  LearningContent,
  Assessment,
  QuestionBankItem,
  StudentProgress,
  Certificate,
} from '../../types';
import {
  fetchCourses,
  fetchModules,
  fetchLessons,
  fetchLearningContent,
  fetchAssessments,
  fetchQuestions,
} from '../../lib/academicService';
import {
  fetchStudentProgress,
  markLessonComplete,
  submitAssessmentAttempt,
} from '../../lib/progressService';
import { fetchStudentCertificates } from '../../lib/certificateService';
import {
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface StudentLearningPlayerProps {
  programme: Programme;
  onBackToDashboard: () => void;
  onViewCertificate: (cert: Certificate) => void;
}

export const StudentLearningPlayer: React.FC<StudentLearningPlayerProps> = ({
  programme,
  onBackToDashboard,
  onViewCertificate,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modulesMap, setModulesMap] = useState<Record<string, Module[]>>({});
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  // Assessment taking state
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    passed: boolean;
    totalPoints: number;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Load syllabus and student progress
  useEffect(() => {
    async function loadFullSyllabus() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [cList, assessList, qList, studentProg] = await Promise.all([
          fetchCourses(programme.id),
          fetchAssessments(programme.id),
          fetchQuestions(),
          fetchStudentProgress(currentUser.uid, programme.id),
        ]);

        setCourses(cList);
        setAssessments(assessList);
        setAllQuestions(qList);
        setProgress(studentProg);

        // Fetch modules and lessons
        const modMap: Record<string, Module[]> = {};
        const lesMap: Record<string, Lesson[]> = {};
        let firstLesson: Lesson | null = null;

        for (const c of cList) {
          const mList = await fetchModules(c.id);
          modMap[c.id] = mList;

          for (const m of mList) {
            const lList = await fetchLessons(m.id);
            lesMap[m.id] = lList;
            if (!firstLesson && lList.length > 0) {
              firstLesson = lList[0];
            }
          }
        }

        setModulesMap(modMap);
        setLessonsMap(lesMap);

        if (firstLesson) {
          setActiveLesson(firstLesson);
        }
      } catch (err) {
        console.error('Error loading learning syllabus:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFullSyllabus();
  }, [programme, currentUser]);

  // Load content whenever activeLesson changes
  useEffect(() => {
    if (!activeLesson) return;
    async function loadContent() {
      try {
        const content = await fetchLearningContent(activeLesson!.id);
        setLearningContent(content);
        setAssessmentAnswers({});
        setAssessmentResult(null);
      } catch (err) {
        console.error('Error fetching lesson content:', err);
      }
    }
    loadContent();
  }, [activeLesson]);

  // Gather flat list of all lessons in sequence
  const allLessons: Lesson[] = [];
  courses.forEach((c) => {
    (modulesMap[c.id] || []).forEach((m) => {
      (lessonsMap[m.id] || []).forEach((l) => {
        allLessons.push(l);
      });
    });
  });

  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Active lesson assessment (if linked)
  const currentAssessment = activeLesson
    ? assessments.find((a) => a.lessonId === activeLesson.id || a.moduleId === activeLesson.moduleId)
    : null;

  const currentQuestions = currentAssessment
    ? allQuestions.filter((q) => currentAssessment.questionIds?.includes(q.id))
    : [];

  const isLessonComplete = (lessonId: string) => {
    return progress?.completedLessons?.includes(lessonId);
  };

  const handleMarkComplete = async () => {
    if (!currentUser || !activeLesson) return;
    setSavingProgress(true);
    try {
      const updated = await markLessonComplete(
        currentUser.uid,
        userProfile?.fullName || 'Student',
        currentUser.email || '',
        programme,
        activeLesson.id,
        allLessons,
        assessments
      );
      setProgress(updated);

      // Auto advance to next lesson if available
      if (nextLesson) {
        setActiveLesson(nextLesson);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentAssessment) return;
    setSubmittingQuiz(true);
    try {
      const res = await submitAssessmentAttempt(
        currentUser.uid,
        userProfile?.fullName || 'Student',
        currentUser.email || '',
        programme,
        currentAssessment,
        currentQuestions,
        assessmentAnswers,
        allLessons,
        assessments
      );
      setAssessmentResult({
        score: res.score,
        passed: res.passed,
        totalPoints: res.totalPoints,
      });

      // Reload fresh progress
      const p = await fetchStudentProgress(currentUser.uid, programme.id);
      setProgress(p);
    } catch (err) {
      console.error('Assessment submission error:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleCheckIssuedCertificate = async () => {
    if (!currentUser) return;
    const certs = await fetchStudentCertificates(currentUser.uid);
    const myCert = certs.find((c) => c.programmeId === programme.id);
    if (myCert) {
      onViewCertificate(myCert);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Loading structured syllabus and learning materials...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      {/* LEFT SIDEBAR: Course & Lesson Navigation */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-blue-900 font-mono font-semibold">
              {programme.code}
            </span>
            <h2 className="text-sm font-serif font-bold text-slate-900 leading-snug line-clamp-2">
              {programme.name}
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Coursework Progress</span>
              <span className="font-semibold text-slate-800">{progress?.completionPercentage || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-300"
                style={{ width: `${progress?.completionPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Syllabus Tree */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {courses.map((course, cIdx) => (
            <div key={course.id} className="space-y-3">
              <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Course {cIdx + 1}: {course.title}</span>
              </div>

              <div className="space-y-4 pl-2 border-l border-slate-200">
                {(modulesMap[course.id] || []).map((module) => (
                  <div key={module.id} className="space-y-2">
                    <p className="text-[11px] font-medium text-slate-600">
                      {module.title}
                    </p>

                    <div className="space-y-1">
                      {(lessonsMap[module.id] || []).map((lesson) => {
                        const isSelected = activeLesson?.id === lesson.id;
                        const complete = isLessonComplete(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-2 rounded-md flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-blue-900 text-white font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 line-clamp-1 pr-2">
                              {complete ? (
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? 'text-emerald-300' : 'text-emerald-600'
                                  }`}
                                />
                              ) : (
                                <Circle
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? 'text-blue-300' : 'text-slate-300'
                                  }`}
                                />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                              {lesson.estimatedMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN LEARNING CONTENT AREA */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto">
        {/* Top Celebration Banner when Programme Completed */}
        {progress?.isCompleted && (
          <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-300 shrink-0" />
              <div>
                <p className="text-xs uppercase font-semibold tracking-wider text-emerald-200">
                  Academic Requirements Fulfilled
                </p>
                <h3 className="text-sm font-serif font-bold text-white">
                  Congratulations! You have completed this Certificate Programme.
                </h3>
              </div>
            </div>
            <button
              onClick={handleCheckIssuedCertificate}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded shadow-sm transition-colors"
            >
              View Official Certificate
            </button>
          </div>
        )}

        <div className="max-w-4xl w-full mx-auto px-6 py-8 sm:py-12 space-y-8">
          {activeLesson ? (
            <>
              {/* Lesson Heading */}
              <div className="border-b border-slate-200 pb-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono uppercase font-semibold text-blue-900">
                    {activeLesson.activityType}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson.estimatedMinutes} minutes study time
                  </span>
                  <span>•</span>
                  <span>{activeLesson.points} Academic Points</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                  {activeLesson.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeLesson.description}
                </p>
              </div>

              {/* 14-Section Academic Content Render */}
              {learningContent && learningContent.sections ? (
                <div className="space-y-8 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {/* 1. Introduction */}
                  {learningContent.sections.introduction && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        1. Introduction
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {learningContent.sections.introduction}
                      </p>
                    </div>
                  )}

                  {/* 2. Learning Objectives */}
                  {learningContent.sections.learningObjectives && (
                    <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        2. Learning Objectives
                      </h3>
                      <div className="whitespace-pre-line text-blue-900 font-medium">
                        {learningContent.sections.learningObjectives}
                      </div>
                    </div>
                  )}

                  {/* 3. Prerequisites */}
                  {learningContent.sections.prerequisites && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        3. Conceptual Prerequisites
                      </h3>
                      <p>{learningContent.sections.prerequisites}</p>
                    </div>
                  )}

                  {/* 4. Main Content */}
                  {learningContent.sections.mainContent && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-base font-serif font-bold text-slate-900">
                        4. Core Theoretical Principles
                      </h3>
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                        {learningContent.sections.mainContent}
                      </div>
                    </div>
                  )}

                  {/* 5. Key Concepts */}
                  {learningContent.sections.keyConcepts && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        5. Key Concepts & Taxonomies
                      </h3>
                      <div className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                        {learningContent.sections.keyConcepts}
                      </div>
                    </div>
                  )}

                  {/* 6. Examples */}
                  {learningContent.sections.examples && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        6. Applied Examples
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {learningContent.sections.examples}
                      </p>
                    </div>
                  )}

                  {/* 7. Practical Application */}
                  {learningContent.sections.practicalApplication && (
                    <div className="p-5 rounded-xl bg-slate-100/60 border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        7. Practical Implementation Notes
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {learningContent.sections.practicalApplication}
                      </p>
                    </div>
                  )}

                  {/* 8. Case Study */}
                  {learningContent.sections.caseStudy && (
                    <div className="p-6 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        8. Empirical Case Study
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {learningContent.sections.caseStudy}
                      </p>
                    </div>
                  )}

                  {/* 9. Activity */}
                  {learningContent.sections.activity && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        9. Practical Exercise
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {learningContent.sections.activity}
                      </p>
                    </div>
                  )}

                  {/* 10. Self-Check */}
                  {learningContent.sections.selfCheck && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        10. Self-Check Concept Review
                      </h3>
                      <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                        {learningContent.sections.selfCheck}
                      </div>
                    </div>
                  )}

                  {/* 11. Key Takeaways */}
                  {learningContent.sections.keyTakeaways && (
                    <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                      <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        11. Essential Takeaways
                      </h3>
                      <p className="text-emerald-900 leading-relaxed">
                        {learningContent.sections.keyTakeaways}
                      </p>
                    </div>
                  )}

                  {/* 12. Glossary */}
                  {learningContent.sections.glossary && (
                    <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
                      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        12. Academic Glossary
                      </h3>
                      <div className="whitespace-pre-line text-xs text-slate-600">
                        {learningContent.sections.glossary}
                      </div>
                    </div>
                  )}

                  {/* 13. Conclusion */}
                  {learningContent.sections.conclusion && (
                    <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        13. Conclusion
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        {learningContent.sections.conclusion}
                      </p>
                    </div>
                  )}

                  {/* 14. Further Reading */}
                  {learningContent.sections.furtherReading && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        14. Further Academic Citations
                      </h3>
                      <p>{learningContent.sections.furtherReading}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-white border border-slate-200 text-slate-600 space-y-3">
                  <BookOpen className="w-8 h-8 text-blue-900" />
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Comprehensive Academic Reading
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Review this module's required literature and instructional notes thoroughly before marking complete.
                  </p>
                </div>
              )}

              {/* INTEGRATED ASSESSMENT (If present for this lesson/module) */}
              {currentAssessment && currentQuestions.length > 0 && (
                <div className="mt-12 p-6 sm:p-8 rounded-xl bg-white border-2 border-blue-900/40 shadow-sm space-y-6">
                  <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-blue-900 font-mono font-semibold">
                        Formative Academic Evaluation
                      </span>
                      <h3 className="text-lg font-serif font-bold text-slate-900">
                        {currentAssessment.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Passing criteria: {currentAssessment.passingScore}% • {currentQuestions.length} questions
                      </p>
                    </div>
                    <div className="text-xs font-semibold bg-blue-50 text-blue-900 px-3 py-1 rounded">
                      Weight: {currentAssessment.assessmentWeight}%
                    </div>
                  </div>

                  <form onSubmit={handleAssessmentSubmit} className="space-y-6">
                    {currentQuestions.map((q, qIndex) => (
                      <div key={q.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Question {qIndex + 1}: {q.questionText}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {q.points} pts
                          </span>
                        </div>

                        {q.questionType === 'multiple_choice' && (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, optIndex) => (
                              <label
                                key={optIndex}
                                className={`flex items-center gap-3 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                                  assessmentAnswers[q.id] === opt
                                    ? 'bg-blue-50 border-blue-700 text-blue-950 font-medium'
                                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value={opt}
                                  checked={assessmentAnswers[q.id] === opt}
                                  onChange={() =>
                                    setAssessmentAnswers({
                                      ...assessmentAnswers,
                                      [q.id]: opt,
                                    })
                                  }
                                  className="text-blue-900 focus:ring-blue-900"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {assessmentResult && (
                          <div
                            className={`p-3 rounded text-xs mt-2 ${
                              assessmentAnswers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                          >
                            <p className="font-semibold">
                              Correct Answer: {q.correctAnswer}
                            </p>
                            <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                              Academic Explanation: {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="submit"
                        disabled={submittingQuiz || Object.keys(assessmentAnswers).length === 0}
                        className="px-6 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                      >
                        {submittingQuiz ? 'Submitting Responses...' : 'Submit Assessment'}
                      </button>

                      {assessmentResult && (
                        <div
                          className={`text-xs font-bold px-4 py-2 rounded ${
                            assessmentResult.passed
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {assessmentResult.passed ? 'PASSED' : 'NEEDS REVISION'}: {assessmentResult.score}%
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Select a lesson from the sidebar to begin study.
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 px-6 sm:px-12 flex items-center justify-between">
          <button
            disabled={!prevLesson}
            onClick={() => prevLesson && setActiveLesson(prevLesson)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 disabled:opacity-30 flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Lesson</span>
          </button>

          {activeLesson && (
            <button
              id="mark-lesson-complete-btn"
              disabled={savingProgress || isLessonComplete(activeLesson.id)}
              onClick={handleMarkComplete}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-2 ${
                isLessonComplete(activeLesson.id)
                  ? 'bg-emerald-100 text-emerald-900 cursor-default'
                  : 'bg-[#0a192f] hover:bg-slate-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {savingProgress
                  ? 'Saving...'
                  : isLessonComplete(activeLesson.id)
                  ? 'Lesson Completed'
                  : 'Mark Complete & Continue'}
              </span>
            </button>
          )}

          <button
            disabled={!nextLesson}
            onClick={() => nextLesson && setActiveLesson(nextLesson)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 disabled:opacity-30 flex items-center gap-1.5 transition-colors"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
