import React from 'react';
import { Transcript } from '../../types';
import { Printer, ShieldCheck, ArrowLeft, Award } from 'lucide-react';

interface StudentTranscriptViewProps {
  transcript: Transcript;
  onBack: () => void;
}

export const StudentTranscriptView: React.FC<StudentTranscriptViewProps> = ({
  transcript,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Transcript</span>
        </button>
      </div>

      {/* Official Transcript Sheet */}
      <div className="bg-white border border-slate-300 shadow-md p-8 sm:p-12 rounded-lg text-slate-900 space-y-8 print:border-none print:shadow-none">
        {/* Institutional Transcript Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0a192f] text-white flex items-center justify-center font-serif text-2xl font-bold">
              N
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 uppercase tracking-tight">
                Nova International University
              </h1>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                Official Academic Transcript • Certificate Division
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-500 space-y-0.5">
            <p className="font-mono font-semibold text-slate-900">Transcript ID: {transcript.id.slice(0, 10)}</p>
            <p>Issued: {new Date(transcript.issueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Student and Programme Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Student Record
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">{transcript.studentName}</p>
            <p className="text-slate-600 font-mono text-xs">{transcript.studentEmail}</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Certificate Award
            </span>
            <p className="text-base font-bold text-blue-950 mt-1">{transcript.programmeName}</p>
            <p className="text-slate-600 font-mono text-xs">Code: {transcript.programmeCode}</p>
          </div>
        </div>

        {/* Coursework & Grades Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Course Module Description</th>
                <th className="py-3 px-4 text-center">Study Hours</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Attained Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {transcript.courses.map((course) => (
                <tr key={course.courseId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{course.courseTitle}</td>
                  <td className="py-3 px-4 text-center font-mono">{course.learningHours} hrs</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">{course.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Final Classification Summary */}
        <div className="border-t-2 border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Final Academic Classification
            </span>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-lg font-serif font-bold text-slate-900">
                Grade: {transcript.finalResult}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                (Cumulative Average: {transcript.gpaOrAverage}%)
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p className="font-serif italic text-base text-slate-800 font-semibold">akinssokpah</p>
            <p className="text-[10px] uppercase tracking-wider">President & Academic Registry</p>
          </div>
        </div>

        {/* Institutional Scope Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          «NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
        </div>
      </div>
    </div>
  );
};
