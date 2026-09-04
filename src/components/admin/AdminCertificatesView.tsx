import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Certificate } from '../../types';
import { revokeCertificate } from '../../lib/certificateService';
import { CertificateTemplate } from '../certificate/CertificateTemplate';
import { Award, Search, ShieldCheck, ShieldAlert, Eye, Ban } from 'lucide-react';

export const AdminCertificatesView: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadCertificates = async () => {
    try {
      const snap = await getDocs(collection(db, 'certificates'));
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Certificate[];
      setCertificates(list);
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleRevoke = async (cert: Certificate) => {
    const reason = prompt(
      `Enter formal reason for revoking credential ${cert.certificateNumber}:`,
      'Academic integrity policy breach or administrative recalculation'
    );
    if (!reason) return;

    setRevokingId(cert.id);
    try {
      await revokeCertificate(cert.id, reason);
      await loadCertificates();
      alert(`Certificate ${cert.certificateNumber} has been revoked.`);
    } catch (err) {
      console.error('Revocation error:', err);
      alert('Failed to revoke certificate.');
    } finally {
      setRevokingId(null);
    }
  };

  const filtered = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.programmeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <CertificateTemplate
              certificate={selectedCert}
              onClose={() => setSelectedCert(null)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Institutional Registry
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Certificates Registry ({certificates.length})
          </h1>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificate records..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading certificate registry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No certificates found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Programme Award</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {cert.certificateNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{cert.studentName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{cert.studentEmail}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {cert.programmeName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cert.status === 'valid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cert.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                    {cert.status === 'valid' && (
                      <button
                        disabled={revokingId === cert.id}
                        onClick={() => handleRevoke(cert)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-medium text-[11px] inline-flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> Revoke
                      </button>
                    )}
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
