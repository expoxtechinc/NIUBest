import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Enrollment } from '../../types';
import { fetchAllEnrollments } from '../../lib/progressService';
import { Users, Search, Mail, Calendar, ShieldCheck, GraduationCap } from 'lucide-react';

export const AdminStudentsView: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersSnap, enrList] = await Promise.all([
          getDocs(collection(db, 'users')),
          fetchAllEnrollments(),
        ]);
        const list = usersSnap.docs.map((d) => d.data() as UserProfile);
        setStudents(list);
        setEnrollments(enrList);
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Institutional Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Students & Enrollees ({students.length})
          </h1>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student registry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No students found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Academic Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Active Enrollments</th>
                <th className="py-3 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s) => {
                const myEnrollments = enrollments.filter((e) => e.studentId === s.uid);
                return (
                  <tr key={s.uid} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {s.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {myEnrollments.length > 0 ? (
                        <div className="space-y-1">
                          {myEnrollments.map((e) => (
                            <span
                              key={e.id}
                              className="inline-block text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono mr-1.5"
                            >
                              {e.programmeCode} ({e.status})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active enrollments</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
