import React from 'react';
import { ShieldCheck, Database, Key, AlertTriangle, Building, CheckCircle2 } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
          Institutional Configuration
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
          Governance & Infrastructure Settings
        </h1>
      </div>

      {/* Institutional Identity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-serif font-bold text-slate-900">
            Institutional Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Full Institution Name</label>
            <input
              type="text"
              readOnly
              value="Nova International University"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Short Name / Monogram</label>
            <input
              type="text"
              readOnly
              value="NIU"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Certificate Signatory Authority</label>
            <input
              type="text"
              readOnly
              value="akinssokpah (Founder & President)"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Active Academic Scope</label>
            <input
              type="text"
              readOnly
              value="Certificate Programmes Only"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Authorized Admin Principals */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Key className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-serif font-bold text-slate-900">
            Authorized Administrative Principals
          </h2>
        </div>

        <p className="text-slate-600 leading-relaxed">
          The following Google email identities possess immutable administrative authority enforced both in client authentication contexts and server-side authorization:
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
            <span className="text-slate-800 font-semibold">aki.sokpah.link@gmail.com</span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Superadmin
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
            <span className="text-slate-800 font-semibold">makealuckspam@gmail.com</span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Superadmin
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory Compliance Notice */}
      <div className="bg-amber-50/60 p-6 rounded-xl border border-amber-200 shadow-xs space-y-3 text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-serif font-bold text-amber-900">
            Mandatory Institutional Disclaimer Compliance
          </h2>
        </div>

        <p className="leading-relaxed text-amber-900/90">
          In strict adherence to consumer protection and academic compliance directives, Nova International University must never falsely claim government degree-granting accreditation or ranking. The following notice is displayed across all public pages, certificates, and student portals:
        </p>

        <blockquote className="p-3 bg-white/80 border-l-4 border-amber-600 italic rounded font-medium text-slate-800">
          «Nova International University currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
        </blockquote>
      </div>

      {/* Backend Infrastructure */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-blue-900" />
          <h2 className="text-sm font-serif font-bold text-slate-900">
            Backend Cloud Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Firestore (Production Database)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Authentication (Google & Password)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gemini 2.5 Flash Academic Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fortress Firestore Security Rules Deployed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
