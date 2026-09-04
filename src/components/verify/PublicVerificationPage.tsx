import React, { useState, useEffect } from 'react';
import { verifyCertificateRecord } from '../../lib/certificateService';
import { VerificationRecord } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Award,
  FileText,
} from 'lucide-react';

interface PublicVerificationPageProps {
  initialLookupId?: string;
  onNavigateHome: () => void;
  onViewCertificate?: (certId: string) => void;
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({
  initialLookupId = '',
  onNavigateHome,
  onViewCertificate,
}) => {
  const [lookupQuery, setLookupQuery] = useState(initialLookupId);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialLookupId) {
      handleSearch(initialLookupId);
    }
  }, [initialLookupId]);

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse || lookupQuery).trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await verifyCertificateRecord(q);
      setRecord(res);
    } catch (err) {
      console.error('Verification query error:', err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Certificate Verification Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify the official status and academic validity of any certificate issued by Nova International University.
        </p>
      </div>

      {/* Verification Lookup Input */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Certificate Number, ID, or Verification Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                id="verify-input-field"
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="e.g. NIU-CYB401-ABC1234 or VRF-XXXX-XXXX"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <button
              id="verify-search-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Scan the QR code on a physical or digital NIU certificate, or enter its serial code manually.
          </p>
        </form>
      </div>

      {/* Results Section */}
      {searched && !loading && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-200">
          {record && record.status === 'Valid' ? (
            <div className="bg-white rounded-xl border-2 border-emerald-500/80 shadow-md overflow-hidden">
              {/* Valid Status Header */}
              <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold opacity-90 block">
                      Official Verification Status
                    </span>
                    <h2 className="text-lg font-serif font-bold">Valid & Authenticated Certificate</h2>
                  </div>
                </div>
                <span className="text-xs bg-emerald-800/80 px-2.5 py-1 rounded font-mono">
                  AUTHENTIC
                </span>
              </div>

              {/* Record Metadata */}
              <div className="p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase">Recipient Name</span>
                    <span className="font-semibold text-slate-900 text-base">{record.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase">Certificate Serial</span>
                    <span className="font-mono font-semibold text-slate-800">{record.certificateNumber}</span>
                  </div>
                </div>

                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase">Academic Programme</span>
                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    {record.programmeName}
                  </h3>
                  <span className="text-xs text-blue-900 font-mono font-semibold">
                    {record.programmeCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase">Issue Date</span>
                    <span className="text-slate-800 font-medium">
                      {new Date(record.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase">Verification Code</span>
                    <span className="font-mono text-slate-800 font-medium">{record.verificationCode}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>Authorized Signature: President akinssokpah</span>
                  <span>Nova International University</span>
                </div>
              </div>
            </div>
          ) : record && record.status === 'Revoked' ? (
            <div className="bg-white rounded-xl border-2 border-red-500 shadow-md overflow-hidden">
              <div className="bg-red-700 text-white p-5 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-white shrink-0" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold opacity-90 block">
                    Verification Notice
                  </span>
                  <h2 className="text-lg font-serif font-bold">Certificate Has Been Revoked</h2>
                </div>
              </div>
              <div className="p-6 text-xs sm:text-sm text-slate-700 space-y-3">
                <p>
                  The certificate associated with code <strong>{record.certificateNumber}</strong> has been officially revoked by the Academic Registry due to academic integrity or policy violations.
                </p>
                <p className="text-xs text-slate-500">
                  This credential is no longer recognized as valid by Nova International University.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-300 p-8 text-center space-y-3 shadow-xs">
              <XCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h2 className="text-base font-serif font-bold text-slate-900">
                No Certificate Record Found
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                We could not find an active or authentic certificate matching the query <span className="font-mono font-semibold text-slate-800">"{lookupQuery}"</span> in the NIU registry.
              </p>
              <div className="pt-2">
                <p className="text-[11px] text-slate-400">
                  Please verify the exact certificate number, or contact academics@niu.ac.digital for assistance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scope Disclaimer */}
      <div className="max-w-xl mx-auto p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.
      </div>
    </div>
  );
};
