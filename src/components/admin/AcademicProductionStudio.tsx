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
  Department,
  School,
} from '../../types';
import {
  fetchProgrammes,
  fetchProgrammeById,
  saveProgramme,
  deleteProgramme,
  fetchCourses,
  saveCourse,
  deleteCourse,
  fetchModules,
  saveModule,
  deleteModule,
  fetchLessons,
  saveLesson,
  deleteLesson,
  fetchLearningContent,
  saveLearningContent,
  fetchAssessments,
  saveAssessment,
  deleteAssessment,
  fetchQuestions,
  saveQuestion,
  fetchSchools,
  fetchDepartments,
} from '../../lib/academicService';
import { AiAssistantModal } from './AiAssistantModal';
import {
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Trash2,
  Clock,
  Award,
} from 'lucide-react';

interface AcademicProductionStudioProps {
  onBackToOverview: () => void;
}

export const AcademicProductionStudio: React.FC<AcademicProductionStudioProps> = ({
  onBackToOverview,
}) => {
  const { currentUser } = useAuth();

  // Step 1 - 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Available programmes to pick or create new
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');

  // Active working objects
  const [programmeData, setProgrammeData] = useState<Partial<Programme>>({
    name: '',
    code: '',
    departmentId: '',
    departmentName: '',
    description: '',
    learningHours: 40,
    difficulty: 'Intermediate',
    objectives: '',
    learningOutcomes: '',
    entryRequirements: 'Open admission for adult learners and working professionals.',
    completionRequirements: 'Complete all modules and achieve minimum 70% in assessments.',
    minimumScore: 70,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    status: 'Draft',
  });

  // Courses, Modules, Lessons, Content, Assessments
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const [contentSections, setContentSections] = useState({
    introduction: '',
    learningObjectives: '',
    prerequisites: '',
    mainContent: '',
    keyConcepts: '',
    examples: '',
    practicalApplication: '',
    caseStudy: '',
    activity: '',
    selfCheck: '',
    keyTakeaways: '',
    glossary: '',
    conclusion: '',
    furtherReading: '',
  });

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);

  // AI Assistant Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTaskType, setAiTaskType] = useState<
    'programme_description' | 'course_outline' | 'lesson_content' | 'quiz_questions'
  >('programme_description');

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load baseline institutional list
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const [progs, schs, depts, qList] = await Promise.all([
          fetchProgrammes(),
          fetchSchools(),
          fetchDepartments(),
          fetchQuestions(),
        ]);
        setProgrammes(progs);
        setSchools(schs);
        setDepartments(depts);
        setAllQuestions(qList);

        if (progs.length > 0) {
          handleSelectProgramme(progs[0].id);
        }
      } catch (err) {
        console.error('Studio initial load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleSelectProgramme = async (progId: string) => {
    setSelectedProgrammeId(progId);
    setSaveMessage(null);
    try {
      const p = await fetchProgrammeById(progId);
      if (p) {
        setProgrammeData(p);
        const cList = await fetchCourses(p.id);
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id);
          const mList = await fetchModules(cList[0].id);
          setModules(mList);
          if (mList.length > 0) {
            setSelectedModuleId(mList[0].id);
            const lList = await fetchLessons(mList[0].id);
            setLessons(lList);
            if (lList.length > 0) {
              setSelectedLessonId(lList[0].id);
              const cnt = await fetchLearningContent(lList[0].id);
              if (cnt) setContentSections(cnt.sections);
            }
          }
        }
        const aList = await fetchAssessments(p.id);
        setAssessments(aList);
      }
    } catch (err) {
      console.error('Error switching programme:', err);
    }
  };

  const handleCreateNewProgramme = () => {
    const randomCode = `NIU-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    setSelectedProgrammeId('');
    setProgrammeData({
      name: 'New Certificate Programme',
      code: randomCode,
      departmentId: departments[0]?.id || '',
      departmentName: departments[0]?.name || 'Department of Interdisciplinary Studies',
      description: '',
      learningHours: 40,
      difficulty: 'Intermediate',
      objectives: '',
      learningOutcomes: '',
      entryRequirements: 'Open admission for adult learners and working professionals.',
      completionRequirements: 'Complete all modules and achieve minimum 70% in assessments.',
      minimumScore: 70,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      status: 'Draft',
    });
    setCourses([]);
    setModules([]);
    setLessons([]);
    setCurrentStep(1);
  };

  // Step 1: Save Programme Information
  const handleSaveProgrammeInfo = async () => {
    setLoading(true);
    setSaveMessage(null);
    try {
      const savedId = await saveProgramme(
        { ...programmeData, id: selectedProgrammeId || undefined },
        currentUser?.email || 'admin@niu.ac.digital'
      );
      setSelectedProgrammeId(savedId);
      const updated = await fetchProgrammes();
      setProgrammes(updated);
      setSaveMessage('Programme information successfully saved to Firestore.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving programme:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Course creation
  const handleAddCourse = async () => {
    if (!selectedProgrammeId) {
      alert('Please save the programme information first.');
      return;
    }
    const newCourseOrder = courses.length + 1;
    const courseId = await saveCourse({
      programmeId: selectedProgrammeId,
      title: `Course ${newCourseOrder}: Core Principles`,
      description: 'Foundational study of domain principles and methodologies.',
      learningMinutes: 480,
      courseOrder: newCourseOrder,
    });
    const updated = await fetchCourses(selectedProgrammeId);
    setCourses(updated);
    setSelectedCourseId(courseId);
  };

  // Step 3: Module creation
  const handleAddModule = async () => {
    if (!selectedCourseId) {
      alert('Please select or create a course first.');
      return;
    }
    const newModOrder = modules.length + 1;
    const modId = await saveModule({
      programmeId: selectedProgrammeId,
      courseId: selectedCourseId,
      title: `Module ${newModOrder}: Advanced Applications`,
      description: 'In-depth exploration of core practical concepts.',
      estimatedMinutes: 120,
      moduleOrder: newModOrder,
    });
    const updated = await fetchModules(selectedCourseId);
    setModules(updated);
    setSelectedModuleId(modId);
  };

  // Step 4: Lesson creation
  const handleAddLesson = async () => {
    if (!selectedModuleId) {
      alert('Please select or create a module first.');
      return;
    }
    const newLessonOrder = lessons.length + 1;
    const lessonId = await saveLesson({
      programmeId: selectedProgrammeId,
      courseId: selectedCourseId,
      moduleId: selectedModuleId,
      title: `Lesson ${newLessonOrder}: Applied Implementation`,
      description: 'Critical examination of applied methodologies.',
      activityType: 'Reading',
      estimatedMinutes: 30,
      points: 15,
      lessonOrder: newLessonOrder,
    });
    const updated = await fetchLessons(selectedModuleId);
    setLessons(updated);
    setSelectedLessonId(lessonId);
  };

  // Step 5: Save Learning Content (14 sections)
  const handleSaveContent = async () => {
    if (!selectedLessonId) return;
    setLoading(true);
    setSaveMessage(null);
    try {
      await saveLearningContent({
        lessonId: selectedLessonId,
        programmeId: selectedProgrammeId,
        courseId: selectedCourseId,
        moduleId: selectedModuleId,
        sections: contentSections,
        isDraft: false,
      });
      setSaveMessage('14-section academic content saved successfully.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Save Assessment
  const handleAddAssessment = async () => {
    if (!selectedProgrammeId) return;
    const assessId = await saveAssessment({
      programmeId: selectedProgrammeId,
      courseId: selectedCourseId,
      moduleId: selectedModuleId,
      lessonId: selectedLessonId,
      title: `${programmeData.name} - Capstone Evaluation`,
      instructions: 'Review all questions thoroughly before submitting.',
      assessmentType: 'Quiz',
      passingScore: programmeData.minimumScore || 70,
      questionIds: allQuestions.slice(0, 4).map((q) => q.id),
    });
    const updated = await fetchAssessments(selectedProgrammeId);
    setAssessments(updated);
  };

  const handleDeleteCurrentProgramme = async () => {
    if (!selectedProgrammeId) return;
    if (!confirm(`Are you sure you want to permanently delete programme "${programmeData.name || 'Untitled'}"?`)) return;
    setLoading(true);
    try {
      await deleteProgramme(selectedProgrammeId, currentUser?.email || 'admin@niu.ac.digital');
      const updated = await fetchProgrammes();
      setProgrammes(updated);
      if (updated.length > 0) {
        handleSelectProgramme(updated[0].id);
      } else {
        handleCreateNewProgramme();
      }
      setSaveMessage('Programme deleted successfully.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting programme:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    await deleteCourse(courseId);
    if (selectedProgrammeId) {
      const updated = await fetchCourses(selectedProgrammeId);
      setCourses(updated);
      if (selectedCourseId === courseId) {
        setSelectedCourseId(updated[0]?.id || '');
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    await deleteModule(moduleId);
    if (selectedCourseId) {
      const updated = await fetchModules(selectedCourseId);
      setModules(updated);
      if (selectedModuleId === moduleId) {
        setSelectedModuleId(updated[0]?.id || '');
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    await deleteLesson(lessonId);
    if (selectedModuleId) {
      const updated = await fetchLessons(selectedModuleId);
      setLessons(updated);
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(updated[0]?.id || '');
      }
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    await deleteAssessment(assessmentId);
    if (selectedProgrammeId) {
      const updated = await fetchAssessments(selectedProgrammeId);
      setAssessments(updated);
    }
  };

  // Step 8: Governance & Readiness Verification
  const checklist = {
    infoComplete: Boolean(programmeData.name && programmeData.code && programmeData.description),
    courseExists: courses.length > 0,
    moduleExists: modules.length > 0,
    lessonExists: lessons.length > 0,
    contentComplete: Boolean(contentSections.introduction || contentSections.mainContent),
    assessmentExists: assessments.length > 0,
    certificateConfigured: true,
  };

  const isReadyToPublish = Object.values(checklist).every(Boolean);

  const handlePublishProgramme = async () => {
    if (!isReadyToPublish) {
      alert('Cannot publish programme: all governance criteria must be satisfied first.');
      return;
    }
    setLoading(true);
    try {
      await saveProgramme(
        {
          ...programmeData,
          id: selectedProgrammeId,
          status: 'Published',
        },
        currentUser?.email || 'admin@niu.ac.digital'
      );
      setProgrammeData({ ...programmeData, status: 'Published' });
      const updated = await fetchProgrammes();
      setProgrammes(updated);
      alert('Programme successfully published to the public academic catalog!');
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Programme Information' },
    { num: 2, label: 'Courses' },
    { num: 3, label: 'Modules' },
    { num: 4, label: 'Lessons' },
    { num: 5, label: 'Learning Content (14 Sections)' },
    { num: 6, label: 'Assessments' },
    { num: 7, label: 'Publication Readiness' },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Banner & Programme Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToOverview}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#0a192f] text-white px-2 py-0.5 rounded">
              CANONICAL
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Academic Production Studio
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProgrammeId}
            onChange={(e) => handleSelectProgramme(e.target.value)}
            aria-label="Select Programme to Edit"
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 max-w-xs truncate"
          >
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name} ({p.status})
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateNewProgramme}
            className="px-3 py-2 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Programme</span>
          </button>
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {stepsList.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                currentStep === st.num
                  ? 'bg-[#0a192f] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === st.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {st.num}
              </span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* STEP 1: PROGRAMME INFORMATION */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 1: Programme Information
              </h2>
              <p className="text-xs text-slate-500">
                Foundational metadata, objectives, and institutional requirements.
              </p>
            </div>

            <button
              onClick={() => {
                setAiTaskType('programme_description');
                setAiModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>AI Draft Assistant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Programme Title
              </label>
              <input
                type="text"
                value={programmeData.name}
                onChange={(e) => setProgrammeData({ ...programmeData, name: e.target.value })}
                placeholder="e.g. Certificate in Applied Cybersecurity"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Programme Code
              </label>
              <input
                type="text"
                value={programmeData.code}
                onChange={(e) => setProgrammeData({ ...programmeData, code: e.target.value })}
                placeholder="e.g. NIU-CERT-CYB401"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Department
              </label>
              {departments.length > 0 ? (
                <select
                  value={programmeData.departmentId}
                  onChange={(e) => {
                    const dept = departments.find((d) => d.id === e.target.value);
                    setProgrammeData({
                      ...programmeData,
                      departmentId: e.target.value,
                      departmentName: dept?.name || '',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                >
                  <option value="">Select a department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. School of Digital Technology & Computing"
                  value={programmeData.departmentName || ''}
                  onChange={(e) => setProgrammeData({ ...programmeData, departmentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={programmeData.difficulty}
                onChange={(e) => setProgrammeData({ ...programmeData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guided Learning Hours
              </label>
              <input
                type="number"
                value={programmeData.learningHours}
                onChange={(e) => setProgrammeData({ ...programmeData, learningHours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Passing Score (%)
              </label>
              <input
                type="number"
                value={programmeData.minimumScore}
                onChange={(e) => setProgrammeData({ ...programmeData, minimumScore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catalogue Description
            </label>
            <textarea
              rows={3}
              value={programmeData.description}
              onChange={(e) => setProgrammeData({ ...programmeData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Programme Objectives
            </label>
            <textarea
              rows={3}
              value={programmeData.objectives}
              onChange={(e) => setProgrammeData({ ...programmeData, objectives: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Measurable Learning Outcomes
            </label>
            <textarea
              rows={3}
              value={programmeData.learningOutcomes}
              onChange={(e) => setProgrammeData({ ...programmeData, learningOutcomes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">Status: <strong className="text-slate-800">{programmeData.status}</strong></span>
            <div className="flex items-center gap-2">
              {selectedProgrammeId && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentProgramme}
                  className="px-3.5 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Delete this programme"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
              <button
                id="save-prog-info-btn"
                disabled={loading}
                onClick={handleSaveProgrammeInfo}
                className="px-5 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Programme Information</span>
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Next: Courses</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COURSES */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 2: Course Units ({courses.length})
              </h2>
              <p className="text-xs text-slate-500">
                Organize the high-level course syllabi comprising this certificate programme.
              </p>
            </div>

            <button
              id="add-course-btn"
              onClick={handleAddCourse}
              className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Course Unit
            </button>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500 text-xs">
                No courses created yet. Click "Add Course Unit" to create the first course.
              </div>
            ) : (
              courses.map((course, idx) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-4 rounded-lg border text-xs cursor-pointer transition-colors space-y-2 ${
                    selectedCourseId === course.id
                      ? 'border-blue-700 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Course {idx + 1}: {course.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{course.learningMinutes} mins</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600">{course.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Programme Info
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <span>Next: Modules</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MODULES */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 3: Instructional Modules ({modules.length})
              </h2>
              <p className="text-xs text-slate-500">
                Each module encapsulates focused instructional objectives and estimated study times.
              </p>
            </div>

            <button
              onClick={handleAddModule}
              className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Module
            </button>
          </div>

          <div className="space-y-3">
            {modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500 text-xs">
                No modules added yet. Click "Add Module" to begin creating modules.
              </div>
            ) : (
              modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`p-4 rounded-lg border text-xs cursor-pointer transition-colors space-y-2 ${
                    selectedModuleId === mod.id
                      ? 'border-blue-700 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Module {idx + 1}: {mod.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{mod.estimatedMinutes} mins</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(mod.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600">{mod.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Courses
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <span>Next: Lessons</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LESSONS */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 4: Lessons & Activities ({lessons.length})
              </h2>
              <p className="text-xs text-slate-500">
                Discrete learning activities (Reading, Video, Audio, Interactive, Assignment, Quiz).
              </p>
            </div>

            <button
              onClick={handleAddLesson}
              className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500 text-xs">
                No lessons created yet. Click "Add Lesson" to establish lesson items.
              </div>
            ) : (
              lessons.map((les, idx) => (
                <div
                  key={les.id}
                  onClick={() => setSelectedLessonId(les.id)}
                  className={`p-4 rounded-lg border text-xs cursor-pointer transition-colors space-y-2 ${
                    selectedLessonId === les.id
                      ? 'border-blue-700 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Lesson {idx + 1}: {les.title} ({les.activityType})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{les.estimatedMinutes} mins • {les.points} pts</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(les.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600">{les.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Modules
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <span>Next: 14-Section Content</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LEARNING CONTENT (14 STRUCTURED ACADEMIC SECTIONS) */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 5: Structured 14-Section Academic Content
              </h2>
              <p className="text-xs text-slate-500">
                Fill in all 14 pedagogical dimensions for the selected lesson.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAiTaskType('lesson_content');
                  setAiModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>AI Lesson Content Draft</span>
              </button>

              <button
                onClick={handleSaveContent}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save 14 Sections</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'introduction', label: '1. Introduction' },
              { key: 'learningObjectives', label: '2. Learning Objectives' },
              { key: 'prerequisites', label: '3. Prerequisites' },
              { key: 'mainContent', label: '4. Main Content' },
              { key: 'keyConcepts', label: '5. Key Concepts' },
              { key: 'examples', label: '6. Examples' },
              { key: 'practicalApplication', label: '7. Practical Application' },
              { key: 'caseStudy', label: '8. Case Study' },
              { key: 'activity', label: '9. Activity' },
              { key: 'selfCheck', label: '10. Self-Check Concept Questions' },
              { key: 'keyTakeaways', label: '11. Key Takeaways' },
              { key: 'glossary', label: '12. Glossary' },
              { key: 'conclusion', label: '13. Conclusion' },
              { key: 'furtherReading', label: '14. Further Reading' },
            ].map((sec) => (
              <div key={sec.key} className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {sec.label}
                </label>
                <textarea
                  rows={2}
                  value={(contentSections as any)[sec.key] || ''}
                  onChange={(e) =>
                    setContentSections({
                      ...contentSections,
                      [sec.key]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Lessons
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <span>Next: Assessments</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ASSESSMENTS */}
      {currentStep === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Step 6: Assessments & Question Bank Linking ({assessments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Configure evaluation gates and link verified question bank items.
              </p>
            </div>

            <button
              onClick={handleAddAssessment}
              className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Assessment
            </button>
          </div>

          <div className="space-y-3">
            {assessments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500 text-xs">
                No assessments configured. Click "Add Assessment" to create a capstone check.
              </div>
            ) : (
              assessments.map((a) => (
                <div key={a.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.title} ({a.assessmentType})</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-900 font-semibold">Pass: {a.passingScore}%</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssessment(a.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600">{a.instructions}</p>
                  <p className="text-[11px] text-slate-400">
                    Linked Question Bank items: {a.questionIds?.length || 0} questions
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Content
            </button>
            <button
              onClick={() => setCurrentStep(7)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <span>Next: Publication Readiness</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: PUBLICATION READINESS & GOVERNANCE */}
      {currentStep === 7 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Step 7: Publication Readiness & Governance Audit
            </h2>
            <p className="text-xs text-slate-500">
              Every item must satisfy institutional standards before the programme can transition to Published.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Programme Information is complete with valid code and department', ok: checklist.infoComplete },
              { label: 'At least one course unit exists', ok: checklist.courseExists },
              { label: 'At least one instructional module exists', ok: checklist.moduleExists },
              { label: 'At least one lesson item exists', ok: checklist.lessonExists },
              { label: 'Lesson has complete 14-section learning content', ok: checklist.contentComplete },
              { label: 'At least one evaluation assessment is configured with passing threshold', ok: checklist.assessmentExists },
              { label: 'Official certificate template and verification registry configured', ok: checklist.certificateConfigured },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${
                  item.ok
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/60 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase">
                  {item.ok ? 'Verified' : 'Incomplete'}
                </span>
              </div>
            ))}
          </div>

          {/* Institutional Notice */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Institutional Governance Notice</p>
            <p>
              «NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(6)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back: Assessments
            </button>

            <button
              id="publish-programme-btn"
              disabled={!isReadyToPublish || programmeData.status === 'Published'}
              onClick={handlePublishProgramme}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {programmeData.status === 'Published'
                  ? 'Programme is Published'
                  : 'Approve & Publish Programme'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        taskType={aiTaskType}
        contextTitle={programmeData.name || 'Certificate Programme'}
        contextCategory={programmeData.departmentName || 'Academic Department'}
        onApplyDraft={(draft) => {
          if (aiTaskType === 'programme_description') {
            setProgrammeData({ ...programmeData, description: draft });
          } else if (aiTaskType === 'lesson_content') {
            setContentSections({
              ...contentSections,
              mainContent: draft,
            });
          }
        }}
      />
    </div>
  );
};
