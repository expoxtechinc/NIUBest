import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { History, ShieldCheck, UserCheck, Award, BookOpen } from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const snap = await getDocs(
          query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLogs(list);
      } catch (err) {
        // In case collection is empty or index not created yet
        console.warn('Audit logs query notification:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
          Governance & Compliance
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
          Administrative Audit Trail
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <History className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">Audit Logging Initialized</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              All administrative operations (curriculum publications, credential issuance, revocations, and user role modifications) are immutably preserved in Firestore.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Principal User</th>
                <th className="py-3 px-4">Operation Action</th>
                <th className="py-3 px-4">Entity Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                    {log.userEmail || 'System Superadmin'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-950">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.entityId || log.details || 'System'}
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
