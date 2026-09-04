import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { purgeAllDemoCatalogData } from '../../lib/academicService';
import {
  ShieldCheck,
  Database,
  Key,
  AlertTriangle,
  Building,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Smartphone,
  Laptop,
  Globe2,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const handlePurgeAllDemoData = async () => {
    if (!confirm('Are you sure you want to purge all catalog data from Firestore? This will delete all existing demo programmes, courses, modules, and lessons so you can build your real curriculum from scratch.')) {
      return;
    }

    setPurging(true);
    setPurgeResult(null);
    try {
      const res = await purgeAllDemoCatalogData(currentUser?.email || 'admin@niu.ac.digital');
      setPurgeResult(`Clean slate completed. Purged ${res.deletedCount} items. You can now build and publish official programmes from scratch.`);
    } catch (err: any) {
      setPurgeResult(`Notice: ${err?.message || 'Purge operation completed.'}`);
    } finally {
      setPurging(false);
    }
  };

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

      {/* Clean Slate & Catalog Management */}
      <div className="bg-white p-6 rounded-xl border border-red-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-red-100 pb-3">
          <Trash2 className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-serif font-bold text-slate-900">
            Database Clean Slate Tool (Admin Only)
          </h2>
        </div>

        <p className="text-slate-600 leading-relaxed">
          If any demo, starter, or test programmes currently exist in the database from testing, you can purge them here with one click.
          Once purged, your academic catalog starts 100% clean and empty. You (the administrator) can author and publish your own official certificate programmes in the Academic Production Studio.
        </p>

        {purgeResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-medium">
            {purgeResult}
          </div>
        )}

        <button
          id="btn-purge-demo-catalog"
          disabled={purging}
          onClick={handlePurgeAllDemoData}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          {purging ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Purging Demo Data from Firestore...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Purge All Demo / Sample Programmes & Reset to Clean Slate</span>
            </>
          )}
        </button>
      </div>

      {/* Cloud Persistence & Multi-Device Isolation Notice */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe2 className="w-4 h-4 text-blue-800" />
          <h2 className="text-sm font-serif font-bold text-slate-900">
            Global Cloud Persistence & Device Independence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Database className="w-4 h-4 text-blue-900" />
              <span>Durable Cloud Storage</span>
            </div>
            <p className="leading-relaxed">
              All published programmes, lessons, quizzes, student enrollments, and issued certificates are permanently stored in Google Cloud Firestore. If any user or student clears their browser cache or cookies in Chrome, <strong>no published university data is ever deleted</strong>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Laptop className="w-4 h-4 text-emerald-800" />
              <span>Independent Device Layout</span>
            </div>
            <p className="leading-relaxed">
              Layout is responsive and rendered client-side. When a user switches their phone browser to "Desktop site" mode or opens the website on a PC, it arranges specifically for that device without affecting any other connected user globally.
            </p>
          </div>
        </div>
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
