import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Transcript } from '../../types';
import { StudentTranscriptView } from '../student/StudentTranscriptView';
import { FileText, Search, Eye } from 'lucide-react';

export const AdminTranscriptsView: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const snap = await getDocs(collection(db, 'transcripts'));
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Transcript[];
        setTranscripts(list);
      } catch (err) {
        console.error('Error fetching transcripts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = transcripts.filter(
    (t) =>
      t.studentName.toLowerCase().includes(search.toLowerCase()) ||
      t.programmeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <StudentTranscriptView
              transcript={selectedTranscript}
              onBack={() => setSelectedTranscript(null)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Academic Records
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Official Transcripts ({transcripts.length})
          </h1>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcripts..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading academic transcripts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No transcripts found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4 text-center">Cumulative Grade</th>
                <th className="py-3 px-4 text-center">Avg Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{t.studentName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{t.studentEmail}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{t.programmeName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-blue-950 bg-blue-50 px-2 py-0.5 rounded">
                      {t.finalResult}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">
                    {t.gpaOrAverage}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedTranscript(t)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
