import React, { useState } from 'react';
import { Sparkles, X, AlertCircle, Check, Copy, RefreshCw } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: 'programme_description' | 'course_outline' | 'lesson_content' | 'quiz_questions';
  contextTitle: string;
  contextCategory?: string;
  onApplyDraft: (draftText: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  taskType,
  contextTitle,
  contextCategory = 'Interdisciplinary Studies',
  onApplyDraft,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/academic-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          title: contextTitle,
          category: contextCategory,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate academic draft.');
      }

      setGeneratedDraft(data.draft || '');
    } catch (err: any) {
      console.error('AI assistant request failed:', err);
      setError(err?.message || 'AI Academic Assistant encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveAndApply = () => {
    onApplyDraft(generatedDraft);
    onClose();
  };

  const taskLabels: Record<string, string> = {
    programme_description: 'Draft Programme Description & Objectives',
    course_outline: 'Draft Course Syllabus & Learning Outcomes',
    lesson_content: 'Draft 14-Section Lesson Curriculum Content',
    quiz_questions: 'Draft Rigorous Assessment Questions',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0a192f] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-blue-300 tracking-wider block font-semibold">
                AI Academic Assistant • Gemini 2.5
              </span>
              <h2 className="text-sm sm:text-base font-serif font-bold">
                {taskLabels[taskType] || 'Academic Drafting Assistant'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-slate-700">
          {/* Institutional Human Review Notice */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Institutional Protocol:</strong> AI operates as an academic assistant, not an autonomous authority. All generated drafts require human review and official faculty approval before publication.
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-800">Context Title: <span className="font-normal">{contextTitle || 'Unspecified'}</span></p>
            <p className="font-semibold text-slate-800">Academic Domain: <span className="font-normal">{contextCategory}</span></p>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 text-xs">
              {error}
            </div>
          )}

          {!generatedDraft && !loading && (
            <div className="py-10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-blue-900 mx-auto opacity-70" />
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Generate structured, competency-oriented academic drafts formulated specifically for Nova International University certificate standards.
              </p>
              <button
                id="generate-draft-btn"
                onClick={handleGenerate}
                className="px-5 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Generate Initial Academic Draft
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-900 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">
                Consulting Gemini 2.5 Flash academic reasoning engine...
              </p>
            </div>
          )}

          {generatedDraft && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Generated Draft (Requires Review)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50 text-xs flex items-center gap-1"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50 text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                rows={12}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-blue-900 bg-slate-50/50"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          {generatedDraft && (
            <button
              id="apply-draft-btn"
              onClick={handleApproveAndApply}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Review & Apply to Studio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
