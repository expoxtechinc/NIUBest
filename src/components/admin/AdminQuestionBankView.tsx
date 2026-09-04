import React, { useState, useEffect } from 'react';
import { QuestionBankItem } from '../../types';
import { fetchQuestions, saveQuestion } from '../../lib/academicService';
import { AiAssistantModal } from './AiAssistantModal';
import { HelpCircle, Plus, Search, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminQuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New question form state
  const [formData, setFormData] = useState<Partial<QuestionBankItem>>({
    questionText: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 10,
    difficulty: 'Intermediate',
  });

  const loadQuestions = async () => {
    try {
      const list = await fetchQuestions();
      setQuestions(list);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText || !formData.correctAnswer) {
      alert('Please provide the question prompt and correct answer.');
      return;
    }
    try {
      await saveQuestion(formData);
      setShowAddForm(false);
      setFormData({
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 10,
        difficulty: 'Intermediate',
      });
      await loadQuestions();
    } catch (err) {
      console.error('Save question error:', err);
    }
  };

  const filtered = questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.explanation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Institutional Evaluation Repository
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Question Bank ({questions.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-2 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>AI Draft Questions</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'New Question'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSaveNewQuestion}
          className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs animate-in fade-in"
        >
          <h3 className="text-sm font-serif font-bold text-slate-900">
            Create Academic Question Bank Item
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Question Prompt
            </label>
            <textarea
              rows={2}
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="e.g. In neural architectures, which activation function mitigates the vanishing gradient problem?"
              className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.options?.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Option {String.fromCharCode(65 + idx)}
                </label>
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(formData.options || [])];
                    newOpts[idx] = e.target.value;
                    setFormData({ ...formData, options: newOpts });
                  }}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Correct Answer (Must exactly match an option)
              </label>
              <input
                type="text"
                required
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Points
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Academic Explanation & Feedback Rationale
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Provide pedagogical rationale explaining why this answer is correct..."
              className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-xs"
            >
              Save Question to Bank
            </button>
          </div>
        </form>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading questions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No questions found.
          </div>
        ) : (
          filtered.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-bold text-slate-900 text-sm">
                  {idx + 1}. {q.questionText}
                </span>
                <span className="font-mono text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {q.points} pts • {q.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-2 rounded border text-[11px] ${
                      opt === q.correctAnswer
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt === q.correctAnswer && '✓ '}
                    {opt}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <strong className="text-slate-800">Pedagogical Feedback:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        taskType="quiz_questions"
        contextTitle="Question Bank Drafting"
        onApplyDraft={(draft) => {
          setFormData({
            ...formData,
            questionText: draft.split('\n')[0] || draft,
            explanation: draft,
          });
          setShowAddForm(true);
        }}
      />
    </div>
  );
};
